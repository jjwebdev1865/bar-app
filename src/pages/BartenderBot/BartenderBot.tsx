import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { ChatComposer, ChatTranscript, FinishActions } from '../../components/BartenderBot';
import { BARTENDER_BOT_WELCOME_PARAM, EAppRoute } from '../../constants/routes';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useSettings } from '../../context/SettingsContext';
import { useAuthStore } from '../../stores/authStore';
import type {
  TChatMessage,
  TChatSender,
  TColorTokens,
  TWelcomeStepConfig,
  TWelcomeStepId,
} from '../../types';
import { formatPhoneInput, PHONE_DIGIT_COUNT, phoneDigits } from '../../utils/phoneFormat';
import { containsProfanity } from '../../utils/profanityFilter';

const EMAIL_SCHEMA = z.email();

/** How long the typing indicator sits before the next bot bubble lands. */
const BOT_TYPING_DELAY_MS = 600;

export default function BartenderBotScreen() {
  const { colors, t } = useSettings();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { [BARTENDER_BOT_WELCOME_PARAM]: welcomeParam } =
    useLocalSearchParams<{ [BARTENDER_BOT_WELCOME_PARAM]: string }>();
  const isWelcome = welcomeParam === '1';
  const setEmail = useAuthStore((state) => state.setEmail);
  const setPhone = useAuthStore((state) => state.setPhone);
  const setFavoriteDrink = useAuthStore((state) => state.setFavoriteDrink);
  const setFavoriteShot = useAuthStore((state) => state.setFavoriteShot);

  const [messages, setMessages] = useState<TChatMessage[]>(() =>
    isWelcome
      ? [
          { id: 'greeting', sender: 'bot', text: t('bartenderBotWelcomeGreeting') },
          { id: 'intro', sender: 'bot', text: t('bartenderBotWelcomeIntro') },
        ]
      : [{ id: 'hello', sender: 'bot', text: t('bartenderBotHello') }],
  );
  const [currentStepId, setCurrentStepId] = useState<TWelcomeStepId | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [draftValue, setDraftValue] = useState('');

  const nextMessageIndex = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(
    () => () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    },
    [],
  );

  function pushMessage(sender: TChatSender, text: string) {
    nextMessageIndex.current += 1;
    setMessages((previous) => [
      ...previous,
      { id: `msg-${nextMessageIndex.current}`, sender, text },
    ]);
  }

  // Config-driven so the four questions share one render path instead of one
  // near-identical JSX block each.
  const stepConfigs: Record<TWelcomeStepId, TWelcomeStepConfig> = useMemo(
    () => ({
      email: {
        id: 'email',
        promptKey: 'bartenderBotAskEmail',
        fieldLabelKey: 'email',
        keyboardType: 'email-address',
        autoCapitalize: 'none',
        isValid: (value) => EMAIL_SCHEMA.safeParse(value.trim()).success,
        onSubmitValue: (value) => setEmail(value.trim()),
        ackKeys: ['bartenderBotEmailAck1', 'bartenderBotEmailAck2', 'bartenderBotEmailAck3'],
        next: 'phone',
      },
      phone: {
        id: 'phone',
        promptKey: 'bartenderBotAskPhone',
        fieldLabelKey: 'phone',
        keyboardType: 'phone-pad',
        format: formatPhoneInput,
        isValid: (value) => phoneDigits(value).length === PHONE_DIGIT_COUNT,
        onSubmitValue: (value) => setPhone(value),
        ackKeys: ['bartenderBotPhoneAck1', 'bartenderBotPhoneAck2', 'bartenderBotPhoneAck3'],
        next: 'drink',
      },
      drink: {
        id: 'drink',
        promptKey: 'bartenderBotAskFavoriteDrink',
        fieldLabelKey: 'favoriteDrink',
        isValid: (value) => value.trim().length > 0,
        onSubmitValue: (value) => setFavoriteDrink(value.trim()),
        ackKeys: ['bartenderBotDrinkAck1', 'bartenderBotDrinkAck2', 'bartenderBotDrinkAck3'],
        next: 'shot',
      },
      shot: {
        id: 'shot',
        promptKey: 'bartenderBotAskFavoriteShot',
        fieldLabelKey: 'favoriteShot',
        isValid: (value) => value.trim().length > 0,
        onSubmitValue: (value) => setFavoriteShot(value.trim()),
        ackKeys: ['bartenderBotShotAck1', 'bartenderBotShotAck2', 'bartenderBotShotAck3'],
        next: null,
      },
    }),
    [setEmail, setPhone, setFavoriteDrink, setFavoriteShot],
  );

  function advanceToStep(step: TWelcomeStepId) {
    setIsBotTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      pushMessage('bot', t(stepConfigs[step].promptKey));
      setCurrentStepId(step);
      setDraftValue('');
      setIsBotTyping(false);
    }, BOT_TYPING_DELAY_MS);
  }

  function finishWelcome() {
    setCurrentStepId(null);
    setIsBotTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      pushMessage('bot', t('bartenderBotFinishing'));
      setIsBotTyping(false);
      setIsFinished(true);
    }, BOT_TYPING_DELAY_MS);
  }

  useEffect(() => {
    if (!isWelcome || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    advanceToStep('email');
    // Runs once, on mount, for the welcome questionnaire only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWelcome]);

  const currentStep = currentStepId ? stepConfigs[currentStepId] : null;

  function handleSkip() {
    if (!currentStep) {
      return;
    }

    const step = currentStep;
    pushMessage('user', t('bartenderBotSkippedAnswer'));
    setCurrentStepId(null);
    setIsBotTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      pushMessage('bot', t('bartenderBotSkipAck'));
      setIsBotTyping(false);
      if (step.next) {
        advanceToStep(step.next);
      } else {
        finishWelcome();
      }
    }, BOT_TYPING_DELAY_MS);
  }

  function handleSubmit() {
    if (!currentStep || !currentStep.isValid(draftValue)) {
      return;
    }

    const step = currentStep;
    const value = draftValue.trim();

    if (containsProfanity(value)) {
      pushMessage('user', value);
      setDraftValue('');
      setIsBotTyping(true);
      typingTimeoutRef.current = setTimeout(() => {
        pushMessage('bot', t('bartenderBotProfanityWarning'));
        setIsBotTyping(false);
      }, BOT_TYPING_DELAY_MS);
      // Stays on the same step — the composer re-enables once the answer is rewritten.
      return;
    }

    step.onSubmitValue(draftValue);
    pushMessage('user', value);
    setCurrentStepId(null);
    setIsBotTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      const ackKey = step.ackKeys[Math.floor(Math.random() * step.ackKeys.length)];
      pushMessage('bot', t(ackKey));
      setIsBotTyping(false);
      if (step.next) {
        advanceToStep(step.next);
      } else {
        finishWelcome();
      }
    }, BOT_TYPING_DELAY_MS);
  }

  return (
    <SafeAreaView edges={HEADER_SCREEN_EDGES} style={styles.container}>
      <View style={styles.transcript}>
        <ChatTranscript
          botLabel={t('bartenderBot')}
          colors={colors}
          isBotTyping={isBotTyping}
          messages={messages}
          typingLabel={t('bartenderBotTyping')}
          youLabel={t('chatYouLabel')}
        />
      </View>
      {currentStep ? (
        <ChatComposer
          autoCapitalize={currentStep.autoCapitalize}
          colors={colors}
          fieldLabel={t(currentStep.fieldLabelKey)}
          isSubmitDisabled={!currentStep.isValid(draftValue)}
          keyboardType={currentStep.keyboardType}
          onChangeText={(value) =>
            setDraftValue(currentStep.format ? currentStep.format(value) : value)
          }
          onSkip={handleSkip}
          onSubmit={handleSubmit}
          skipLabel={t('skip')}
          submitLabel={t('submit')}
          value={draftValue}
        />
      ) : isFinished ? (
        <FinishActions
          colors={colors}
          homeLabel={t('bartenderBotGoHome')}
          onHome={() => router.push(EAppRoute.HOME)}
          onProfile={() => router.push(EAppRoute.PROFILE)}
          profileLabel={t('bartenderBotGoProfile')}
        />
      ) : null}
    </SafeAreaView>
  );
}

const createStyles = (colors: TColorTokens) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    transcript: {
      flex: 1,
    },
  });

