import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import {
  ChatComposer,
  ChatMultiSelect,
  ChatOptionList,
  ChatTranscript,
  FinishActions,
} from '../../components/BartenderBot';
import { BARTENDER_BOT_WELCOME_PARAM, EAppRoute } from '../../constants/routes';
import { HEADER_SCREEN_EDGES } from '../../constants/safeAreaEdges';
import { useSettings } from '../../context/SettingsContext';
import { useAuthStore } from '../../stores/authStore';
import { useContactsStore } from '../../stores/contactsStore';
import { useGroupsStore } from '../../stores/groupsStore';
import { useLocationsStore } from '../../stores/locationsStore';
import type {
  TChatMessage,
  TChatOption,
  TChatSender,
  TColorTokens,
  TMenuOptionId,
  TReturningComposerConfig,
  TReturningStage,
  TTranslationKey,
  TWelcomeStepConfig,
  TWelcomeStepId,
} from '../../types';
import { formatContactDisplayName } from '../../utils/contactFormat';
import { getRandomLocationCoordinates } from '../../utils/locationFormat';
import { formatPhoneInput, PHONE_DIGIT_COUNT, phoneDigits } from '../../utils/phoneFormat';
import { containsProfanity } from '../../utils/profanityFilter';
import { contactNameKey } from '../../validation/contactSchema';

const EMAIL_SCHEMA = z.email();

/** How long the typing indicator sits before the next bot bubble lands. */
const BOT_TYPING_DELAY_MS = 600;

/** The returning-user flow's main menu, in the order the buttons render. */
const MENU_OPTIONS: { id: TMenuOptionId; labelKey: TTranslationKey }[] = [
  { id: 'profile', labelKey: 'bartenderBotMenuOptionProfile' },
  { id: 'contact', labelKey: 'bartenderBotMenuOptionContact' },
  { id: 'location', labelKey: 'bartenderBotMenuOptionLocation' },
  { id: 'group', labelKey: 'bartenderBotMenuOptionGroup' },
];

/** Profile fields offered by the "want to edit anything?" menu, same order as the questionnaire. */
const PROFILE_FIELD_IDS: TWelcomeStepId[] = ['email', 'phone', 'drink', 'shot'];

export default function BartenderBotScreen() {
  const { colors, t } = useSettings();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { [BARTENDER_BOT_WELCOME_PARAM]: welcomeParam } =
    useLocalSearchParams<{ [BARTENDER_BOT_WELCOME_PARAM]: string }>();
  const isWelcome = welcomeParam === '1';
  const firstName = useAuthStore((state) => state.user?.firstName ?? '');
  const email = useAuthStore((state) => state.user?.email ?? '');
  const phone = useAuthStore((state) => state.user?.phone ?? '');
  const favoriteDrink = useAuthStore((state) => state.user?.favoriteDrink ?? '');
  const favoriteShot = useAuthStore((state) => state.user?.favoriteShot ?? '');
  const setEmail = useAuthStore((state) => state.setEmail);
  const setPhone = useAuthStore((state) => state.setPhone);
  const setFavoriteDrink = useAuthStore((state) => state.setFavoriteDrink);
  const setFavoriteShot = useAuthStore((state) => state.setFavoriteShot);
  const contacts = useContactsStore((state) => state.contacts);
  const addContact = useContactsStore((state) => state.addContact);
  const addLocation = useLocationsStore((state) => state.addLocation);
  const addGroup = useGroupsStore((state) => state.addGroup);

  const [messages, setMessages] = useState<TChatMessage[]>(() =>
    isWelcome
      ? [
          { id: 'greeting', sender: 'bot', text: t('bartenderBotWelcomeGreeting') },
          { id: 'intro', sender: 'bot', text: t('bartenderBotWelcomeIntro') },
        ]
      : [
          {
            id: 'returning-greeting',
            sender: 'bot',
            text: t('bartenderBotReturningGreeting', { firstName }),
          },
        ],
  );
  const [currentStepId, setCurrentStepId] = useState<TWelcomeStepId | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [draftValue, setDraftValue] = useState('');

  // Returning-user menu flow — mutually exclusive with the welcome questionnaire above,
  // since `isWelcome` never changes after mount.
  const [returningStage, setReturningStage] = useState<TReturningStage | null>(null);
  const [activeProfileStepId, setActiveProfileStepId] = useState<TWelcomeStepId | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<TWelcomeStepId | null>(null);
  const [contactFirstNameDraft, setContactFirstNameDraft] = useState('');
  const [locationNameDraft, setLocationNameDraft] = useState('');
  const [groupNameDraft, setGroupNameDraft] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const nextMessageIndex = useRef(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasStartedRef = useRef(false);
  const hasStartedReturningRef = useRef(false);
  // Holds the profile questionnaire's still-missing fields between steps — a ref
  // rather than state, since nothing renders off it directly and React 19's dev
  // double-invoke of state updaters would otherwise queue the typing timer twice.
  const profileQueueRef = useRef<TWelcomeStepId[]>([]);

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

  // ---- Returning-user menu flow (floating-button entry point) ----

  /** Shows one bot bubble after the typing pause, then runs `after`. */
  function showBotMessageThen(text: string, after?: () => void) {
    setIsBotTyping(true);
    typingTimeoutRef.current = setTimeout(() => {
      pushMessage('bot', text);
      setIsBotTyping(false);
      after?.();
    }, BOT_TYPING_DELAY_MS);
  }

  function showMenu() {
    setReturningStage(null);
    showBotMessageThen(t('bartenderBotMenuPrompt'), () => setReturningStage('menu'));
  }

  function askFreeTextQuestion(promptKey: TTranslationKey, stage: TReturningStage) {
    setReturningStage(null);
    showBotMessageThen(t(promptKey), () => {
      setDraftValue('');
      setReturningStage(stage);
    });
  }

  useEffect(() => {
    if (isWelcome || hasStartedReturningRef.current) {
      return;
    }

    hasStartedReturningRef.current = true;
    showMenu();
    // Runs once, on mount, for the returning-user entry point only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWelcome]);

  function computeMissingProfileFields(): TWelcomeStepId[] {
    const missing: TWelcomeStepId[] = [];
    if (!email) {
      missing.push('email');
    }
    if (!phone) {
      missing.push('phone');
    }
    if (!favoriteDrink) {
      missing.push('drink');
    }
    if (!favoriteShot) {
      missing.push('shot');
    }
    return missing;
  }

  function advanceProfileStep(stepId: TWelcomeStepId) {
    setReturningStage(null);
    showBotMessageThen(t(stepConfigs[stepId].promptKey), () => {
      setDraftValue('');
      setActiveProfileStepId(stepId);
      setReturningStage('profileQueue');
    });
  }

  function advanceProfileQueueOrFinish() {
    const queue = profileQueueRef.current;
    if (queue.length === 0) {
      showProfileEditMenu();
      return;
    }

    const [nextId, ...rest] = queue;
    profileQueueRef.current = rest;
    advanceProfileStep(nextId);
  }

  function showProfileEditMenu() {
    setActiveProfileStepId(null);
    setEditingFieldId(null);
    setReturningStage(null);
    showBotMessageThen(t('bartenderBotEditPrompt'), () => setReturningStage('profileEditMenu'));
  }

  function startProfileFlow() {
    const missing = computeMissingProfileFields();
    if (missing.length === 0) {
      showBotMessageThen(t('bartenderBotProfileAllSet'), () => showProfileEditMenu());
      return;
    }

    profileQueueRef.current = missing.slice(1);
    advanceProfileStep(missing[0]);
  }

  function startGroupFlow() {
    if (contacts.length === 0) {
      showBotMessageThen(t('bartenderBotGroupNeedsContacts'), () => showMenu());
      return;
    }

    askFreeTextQuestion('bartenderBotAskGroupName', 'groupName');
  }

  function handleMenuSelect(optionId: string) {
    const option = MENU_OPTIONS.find((candidate) => candidate.id === optionId);
    if (!option) {
      return;
    }

    pushMessage('user', t(option.labelKey));
    setReturningStage(null);

    if (option.id === 'profile') {
      startProfileFlow();
    } else if (option.id === 'contact') {
      askFreeTextQuestion('bartenderBotAskContactFirstName', 'contactFirstName');
    } else if (option.id === 'location') {
      askFreeTextQuestion('bartenderBotAskLocationName', 'locationName');
    } else {
      startGroupFlow();
    }
  }

  function handleProfileEditSelect(optionId: string) {
    if (optionId === 'done') {
      pushMessage('user', t('bartenderBotEditDone'));
      showMenu();
      return;
    }

    const stepId = optionId as TWelcomeStepId;
    pushMessage('user', t(stepConfigs[stepId].fieldLabelKey));
    setEditingFieldId(stepId);
    setReturningStage(null);
    showBotMessageThen(t(stepConfigs[stepId].promptKey), () => {
      setDraftValue('');
      setReturningStage('profileEditValue');
    });
  }

  function finishContactCreation(newContactFirstName: string, newContactLastName: string) {
    const isDuplicate = contacts.some(
      (contact) =>
        contactNameKey(contact.firstName, contact.lastName) ===
        contactNameKey(newContactFirstName, newContactLastName),
    );

    if (isDuplicate) {
      showBotMessageThen(
        t('bartenderBotContactNameTaken', {
          name: `${newContactFirstName} ${newContactLastName}`,
        }),
        () => askFreeTextQuestion('bartenderBotAskContactFirstName', 'contactFirstName'),
      );
      return;
    }

    addContact({
      id: `contact-${Date.now()}`,
      firstName: newContactFirstName,
      lastName: newContactLastName,
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      favoriteBarId: '',
    });
    showBotMessageThen(
      t('bartenderBotContactAdded', { name: `${newContactFirstName} ${newContactLastName}` }),
      () => showMenu(),
    );
  }

  function finishLocationCreation(name: string, addressLine1: string) {
    addLocation({
      id: `loc-${Date.now()}`,
      name,
      addressLine1,
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      ...getRandomLocationCoordinates(),
    });
    showBotMessageThen(t('bartenderBotLocationAdded', { name }), () => showMenu());
  }

  function startGroupMemberSelection() {
    setSelectedMemberIds([]);
    setReturningStage(null);
    showBotMessageThen(t('bartenderBotGroupPickMembers'), () => setReturningStage('groupMembers'));
  }

  function handleToggleMember(contactId: string) {
    setSelectedMemberIds((ids) =>
      ids.includes(contactId) ? ids.filter((id) => id !== contactId) : [...ids, contactId],
    );
  }

  function handleFinishGroup() {
    if (selectedMemberIds.length === 0) {
      return;
    }

    const members = contacts.filter((contact) => selectedMemberIds.includes(contact.id));
    pushMessage('user', members.map((member) => formatContactDisplayName(member)).join(', '));
    addGroup({ id: `group-${Date.now()}`, name: groupNameDraft, contacts: members });
    setReturningStage(null);
    showBotMessageThen(t('bartenderBotGroupAdded', { name: groupNameDraft }), () => showMenu());
  }

  function getReturningComposerConfig(): TReturningComposerConfig | null {
    switch (returningStage) {
      case 'profileQueue':
      case 'profileEditValue': {
        const stepId = returningStage === 'profileQueue' ? activeProfileStepId : editingFieldId;
        if (!stepId) {
          return null;
        }
        const config = stepConfigs[stepId];
        return {
          fieldLabelKey: config.fieldLabelKey,
          keyboardType: config.keyboardType,
          autoCapitalize: config.autoCapitalize,
          format: config.format,
          isValid: config.isValid,
          skippable: returningStage === 'profileQueue',
        };
      }
      case 'contactFirstName':
        return {
          fieldLabelKey: 'firstName',
          autoCapitalize: 'words',
          isValid: (value) => value.trim().length > 0,
          skippable: false,
        };
      case 'contactLastName':
        return {
          fieldLabelKey: 'lastName',
          autoCapitalize: 'words',
          isValid: (value) => value.trim().length > 0,
          skippable: false,
        };
      case 'locationName':
        return {
          fieldLabelKey: 'locationName',
          autoCapitalize: 'words',
          isValid: (value) => value.trim().length > 0,
          skippable: false,
        };
      case 'locationAddress':
        return {
          fieldLabelKey: 'addressLine1',
          autoCapitalize: 'words',
          isValid: (value) => value.trim().length > 0,
          skippable: false,
        };
      case 'groupName':
        return {
          fieldLabelKey: 'groupName',
          autoCapitalize: 'words',
          isValid: (value) => value.trim().length > 0,
          skippable: false,
        };
      default:
        return null;
    }
  }

  const returningComposerConfig = getReturningComposerConfig();

  function handleReturningSkip() {
    if (returningStage !== 'profileQueue' || !activeProfileStepId) {
      return;
    }

    pushMessage('user', t('bartenderBotSkippedAnswer'));
    setReturningStage(null);
    showBotMessageThen(t('bartenderBotSkipAck'), () => advanceProfileQueueOrFinish());
  }

  function handleReturningSubmit() {
    const config = returningComposerConfig;
    if (!config || !config.isValid(draftValue)) {
      return;
    }

    const value = draftValue.trim();

    if (containsProfanity(value)) {
      pushMessage('user', value);
      setDraftValue('');
      showBotMessageThen(t('bartenderBotProfanityWarning'));
      // Stays on the same stage — the composer re-enables once the answer is rewritten.
      return;
    }

    pushMessage('user', value);
    setDraftValue('');
    setReturningStage(null);

    switch (returningStage) {
      case 'profileQueue': {
        const stepId = activeProfileStepId;
        if (!stepId) {
          return;
        }
        stepConfigs[stepId].onSubmitValue(value);
        const ackKeys = stepConfigs[stepId].ackKeys;
        showBotMessageThen(t(ackKeys[Math.floor(Math.random() * ackKeys.length)]), () =>
          advanceProfileQueueOrFinish(),
        );
        return;
      }
      case 'profileEditValue': {
        const stepId = editingFieldId;
        if (!stepId) {
          return;
        }
        stepConfigs[stepId].onSubmitValue(value);
        const ackKeys = stepConfigs[stepId].ackKeys;
        showBotMessageThen(t(ackKeys[Math.floor(Math.random() * ackKeys.length)]), () =>
          showProfileEditMenu(),
        );
        return;
      }
      case 'contactFirstName':
        setContactFirstNameDraft(value);
        askFreeTextQuestion('bartenderBotAskContactLastName', 'contactLastName');
        return;
      case 'contactLastName':
        finishContactCreation(contactFirstNameDraft, value);
        return;
      case 'locationName':
        setLocationNameDraft(value);
        askFreeTextQuestion('bartenderBotAskLocationAddress', 'locationAddress');
        return;
      case 'locationAddress':
        finishLocationCreation(locationNameDraft, value);
        return;
      case 'groupName':
        setGroupNameDraft(value);
        startGroupMemberSelection();
        return;
      default:
        return;
    }
  }

  const menuOptions: TChatOption[] = MENU_OPTIONS.map((option) => ({
    id: option.id,
    label: t(option.labelKey),
  }));
  const profileEditOptions: TChatOption[] = [
    ...PROFILE_FIELD_IDS.map((id) => ({ id, label: t(stepConfigs[id].fieldLabelKey) })),
    { id: 'done', label: t('bartenderBotEditDone') },
  ];
  const memberOptions: TChatOption[] = contacts.map((contact) => ({
    id: contact.id,
    label: formatContactDisplayName(contact),
  }));

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
      ) : returningComposerConfig ? (
        <ChatComposer
          autoCapitalize={returningComposerConfig.autoCapitalize}
          colors={colors}
          fieldLabel={t(returningComposerConfig.fieldLabelKey)}
          isSubmitDisabled={!returningComposerConfig.isValid(draftValue)}
          keyboardType={returningComposerConfig.keyboardType}
          onChangeText={(value) =>
            setDraftValue(
              returningComposerConfig.format ? returningComposerConfig.format(value) : value,
            )
          }
          onSkip={returningComposerConfig.skippable ? handleReturningSkip : undefined}
          onSubmit={handleReturningSubmit}
          skipLabel={t('skip')}
          submitLabel={t('submit')}
          value={draftValue}
        />
      ) : returningStage === 'menu' ? (
        <ChatOptionList colors={colors} onSelect={handleMenuSelect} options={menuOptions} />
      ) : returningStage === 'profileEditMenu' ? (
        <ChatOptionList
          colors={colors}
          onSelect={handleProfileEditSelect}
          options={profileEditOptions}
        />
      ) : returningStage === 'groupMembers' ? (
        <ChatMultiSelect
          colors={colors}
          doneLabel={t('done')}
          isDoneDisabled={selectedMemberIds.length === 0}
          onDone={handleFinishGroup}
          onToggle={handleToggleMember}
          options={memberOptions}
          selectedIds={selectedMemberIds}
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

