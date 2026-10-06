import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  TBarLocation,
  TChatMessage,
  TChatOption,
  TChatSender,
  TColorTokens,
  TContact,
  TDomainFieldId,
  TDomainId,
  TGroup,
  TMenuOptionId,
  TReturningComposerConfig,
  TReturningStage,
  TTranslationKey,
  TWelcomeStepConfig,
  TWelcomeStepId,
} from '../../types';
import { formatAddressSummary } from '../../utils/addressFormat';
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
  { id: 'group', labelKey: 'bartenderBotMenuOptionGroup' },
  { id: 'location', labelKey: 'bartenderBotMenuOptionLocation' },
];

/** Profile fields offered by the "want to edit anything?" menu, same order as the questionnaire. */
const PROFILE_FIELD_IDS: TWelcomeStepId[] = ['email', 'phone', 'drink', 'shot'];

/** Each `TDomainId`'s Add/Edit/List submenu, in the order the buttons render. */
const DOMAIN_ACTIONS: { id: 'add' | 'edit' | 'list' | 'back'; labelKey: TTranslationKey }[] = [
  { id: 'add', labelKey: 'bartenderBotDomainAdd' },
  { id: 'edit', labelKey: 'bartenderBotDomainEdit' },
  { id: 'list', labelKey: 'bartenderBotDomainList' },
  { id: 'back', labelKey: 'bartenderBotBackToMainMenu' },
];

/** Bot copy for "there's nothing here yet", one per domain. */
const DOMAIN_EMPTY_KEYS: Record<TDomainId, TTranslationKey> = {
  contact: 'bartenderBotNoContactsYet',
  group: 'bartenderBotNoGroupsYet',
  location: 'bartenderBotNoLocationsYet',
};

/**
 * Fields a domain's Edit flow offers to change — every field the info dump
 * (`buildItemInfoText`) shows for that domain, so nothing visible there reads
 * as "not found" when typed back in. Contact's Add flow only ever collects
 * firstName/lastName, but Edit also opens up the fields Add never asked for.
 */
const DOMAIN_EDIT_FIELDS: Record<TDomainId, { id: TDomainFieldId; labelKey: TTranslationKey }[]> = {
  contact: [
    { id: 'firstName', labelKey: 'firstName' },
    { id: 'lastName', labelKey: 'lastName' },
    { id: 'email', labelKey: 'email' },
    { id: 'phone', labelKey: 'phone' },
    { id: 'address', labelKey: 'addressLine1' },
    { id: 'favoriteBar', labelKey: 'favoriteBar' },
  ],
  location: [
    { id: 'name', labelKey: 'locationName' },
    { id: 'address', labelKey: 'addressLine1' },
  ],
  group: [
    { id: 'name', labelKey: 'groupName' },
    { id: 'members', labelKey: 'members' },
  ],
};

/**
 * Matches typed text against a list of options by label — exact first
 * (case-insensitive), then falling back to a `startsWith` prefix so "Bob"
 * finds "Bob Smith" when he's the only Bob. `'ambiguous'` when more than one
 * option's label starts with the typed text and none matched exactly.
 */
function matchChatOption(options: TChatOption[], query: string): TChatOption | 'ambiguous' | null {
  const normalizedQuery = query.trim().toLowerCase();
  const exact = options.find((option) => option.label.toLowerCase() === normalizedQuery);
  if (exact) {
    return exact;
  }

  const startsWith = options.filter((option) => option.label.toLowerCase().startsWith(normalizedQuery));
  if (startsWith.length === 1) {
    return startsWith[0];
  }

  return startsWith.length > 1 ? 'ambiguous' : null;
}

/**
 * Drawer screens stay mounted when navigated away from, so without this the
 * conversation would still be sitting there — mid-questionnaire or deep in the
 * menu flow — the next time the floating button opens it. Remounting
 * `BartenderBotChat` on every focus (via a changing `key`) is what resets it,
 * rather than threading a reset through every piece of chat state by hand.
 */
export default function BartenderBotScreen() {
  const [sessionKey, setSessionKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setSessionKey((key) => key + 1);
    }, []),
  );

  return <BartenderBotChat key={sessionKey} />;
}

function BartenderBotChat() {
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
  const updateContact = useContactsStore((state) => state.updateContact);
  const locations = useLocationsStore((state) => state.locations);
  const addLocation = useLocationsStore((state) => state.addLocation);
  const updateLocation = useLocationsStore((state) => state.updateLocation);
  const groups = useGroupsStore((state) => state.groups);
  const addGroup = useGroupsStore((state) => state.addGroup);
  const updateGroup = useGroupsStore((state) => state.updateGroup);

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
  // Contacts/Groups/Locations submenu — which domain is open, which item is
  // being edited within it, and which of that item's fields is being changed.
  const [activeDomain, setActiveDomain] = useState<TDomainId | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingDomainFieldId, setEditingDomainFieldId] = useState<TDomainFieldId | null>(null);

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

  /** Shows each bubble in order, one typing pause apart, then runs `after`. */
  function showBotMessagesThen(texts: string[], after: () => void) {
    if (texts.length === 0) {
      after();
      return;
    }

    const [next, ...rest] = texts;
    showBotMessageThen(next, () => showBotMessagesThen(rest, after));
  }

  function showMenu() {
    setActiveDomain(null);
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
      showBotMessageThen(t('bartenderBotGroupNeedsContacts'), () => showDomainMenu());
      return;
    }

    askFreeTextQuestion('bartenderBotAskGroupName', 'groupName');
  }

  function startDomainAdd(domain: TDomainId) {
    if (domain === 'contact') {
      askFreeTextQuestion('bartenderBotAskContactFirstName', 'contactFirstName');
    } else if (domain === 'location') {
      askFreeTextQuestion('bartenderBotAskLocationName', 'locationName');
    } else {
      startGroupFlow();
    }
  }

  /** One row per existing contact/group/location, labelled the same way each domain already is. */
  function getDomainItemOptions(domain: TDomainId): TChatOption[] {
    if (domain === 'contact') {
      return contacts.map((contact) => ({ id: contact.id, label: formatContactDisplayName(contact) }));
    }
    if (domain === 'location') {
      return locations.map((location) => ({ id: location.id, label: location.name }));
    }
    return groups.map((group) => ({ id: group.id, label: group.name }));
  }

  function showDomainMenu() {
    setReturningStage(null);
    showBotMessageThen(t('bartenderBotDomainMenuPrompt'), () => setReturningStage('domainMenu'));
  }

  function showEmptyDomainMenu(domain: TDomainId) {
    setReturningStage(null);
    showBotMessageThen(t(DOMAIN_EMPTY_KEYS[domain]), () => setReturningStage('domainEmptyMenu'));
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
      return;
    }

    setActiveDomain(option.id as TDomainId);
    showDomainMenu();
  }

  function handleDomainMenuSelect(actionId: string) {
    const domain = activeDomain;
    if (!domain) {
      return;
    }

    const action = DOMAIN_ACTIONS.find((candidate) => candidate.id === actionId);
    if (!action) {
      return;
    }

    pushMessage('user', t(action.labelKey));
    setReturningStage(null);

    if (action.id === 'back') {
      showMenu();
      return;
    }

    if (action.id === 'add') {
      startDomainAdd(domain);
      return;
    }

    const items = getDomainItemOptions(domain);
    if (items.length === 0) {
      showEmptyDomainMenu(domain);
      return;
    }

    if (action.id === 'list') {
      const names = items.map((item) => item.label).join('\n');
      showBotMessageThen(t('bartenderBotListResult', { names }), () => showDomainMenu());
      return;
    }

    showBotMessageThen(t('bartenderBotEditPickPrompt'), () => setReturningStage('editPick'));
  }

  function handleEmptyDomainMenuSelect(optionId: string) {
    const domain = activeDomain;
    if (!domain) {
      return;
    }

    if (optionId === 'addNow') {
      pushMessage('user', t('bartenderBotAddNow'));
      setReturningStage(null);
      startDomainAdd(domain);
      return;
    }

    pushMessage('user', t('bartenderBotBackToMainMenu'));
    showMenu();
  }

  /** One "Label: value" line per contact field, including the ones Add never collects. */
  function buildContactInfoText(contact: TContact): string {
    const lines = [t('bartenderBotEditInfoPrefix', { name: formatContactDisplayName(contact) })];
    lines.push(`${t('firstName')}: ${contact.firstName}`);
    lines.push(`${t('lastName')}: ${contact.lastName}`);
    lines.push(`${t('email')}: ${contact.email || t('none')}`);
    lines.push(`${t('phone')}: ${contact.phone || t('none')}`);
    lines.push(`${t('address')}: ${formatAddressSummary(contact) || t('none')}`);
    const favoriteBarName = contact.favoriteBarId
      ? locations.find((location) => location.id === contact.favoriteBarId)?.name
      : '';
    lines.push(`${t('favoriteBar')}: ${favoriteBarName || t('none')}`);
    return lines.join('\n');
  }

  function buildLocationInfoText(location: TBarLocation): string {
    const lines = [t('bartenderBotEditInfoPrefix', { name: location.name })];
    lines.push(`${t('locationName')}: ${location.name}`);
    lines.push(`${t('address')}: ${formatAddressSummary(location) || t('none')}`);
    return lines.join('\n');
  }

  function buildGroupInfoText(group: TGroup): string {
    const lines = [t('bartenderBotEditInfoPrefix', { name: group.name })];
    lines.push(`${t('groupName')}: ${group.name}`);
    const memberNames = group.contacts.map((member) => formatContactDisplayName(member)).join(', ');
    lines.push(`${t('members')}: ${memberNames || t('none')}`);
    return lines.join('\n');
  }

  /**
   * Looks the item up by id and renders it — fine for an unmodified record,
   * but never for one this same handler just wrote: `contacts`/`locations`/
   * `groups` are this render's closed-over store snapshot, and a store write
   * doesn't rewind time to make this render see it. Callers showing a
   * just-edited item build its text from the merged object they already have
   * in hand (`buildContactInfoText`/etc. directly) instead of calling this.
   */
  function buildItemInfoText(domain: TDomainId, itemId: string): string {
    if (domain === 'contact') {
      const contact = contacts.find((candidate) => candidate.id === itemId);
      return contact ? buildContactInfoText(contact) : '';
    }
    if (domain === 'location') {
      const location = locations.find((candidate) => candidate.id === itemId);
      return location ? buildLocationInfoText(location) : '';
    }
    const group = groups.find((candidate) => candidate.id === itemId);
    return group ? buildGroupInfoText(group) : '';
  }

  function showEditFieldMenu() {
    setEditingDomainFieldId(null);
    setReturningStage(null);
    showBotMessageThen(t('bartenderBotEditFieldPrompt'), () => setReturningStage('editFieldMenu'));
  }

  /** After a field write lands, show the item as it now stands before asking what's next. */
  function finishFieldEdit(infoText: string) {
    showBotMessageThen(t('bartenderBotItemUpdated'), () =>
      showBotMessageThen(infoText, () => showEditFieldMenu()),
    );
  }

  function proceedToEditItem(domain: TDomainId, itemId: string) {
    setEditingItemId(itemId);
    setReturningStage(null);
    showBotMessageThen(buildItemInfoText(domain, itemId), () => showEditFieldMenu());
  }

  function getEditFieldPromptKey(domain: TDomainId, fieldId: TDomainFieldId): TTranslationKey {
    if (domain === 'contact') {
      if (fieldId === 'firstName') {
        return 'bartenderBotAskContactFirstName';
      }
      if (fieldId === 'lastName') {
        return 'bartenderBotAskContactLastName';
      }
      if (fieldId === 'email') {
        return 'bartenderBotAskEmail';
      }
      if (fieldId === 'phone') {
        return 'bartenderBotAskPhone';
      }
      if (fieldId === 'address') {
        return 'bartenderBotAskLocationAddress';
      }
      return 'bartenderBotAskFavoriteBar';
    }
    if (domain === 'location') {
      return fieldId === 'name' ? 'bartenderBotAskLocationName' : 'bartenderBotAskLocationAddress';
    }
    return 'bartenderBotAskGroupName';
  }

  /** What `fieldId` currently holds on the item being edited, or `''` when it's blank/unset. */
  function getCurrentFieldValue(domain: TDomainId, fieldId: TDomainFieldId): string {
    if (!editingItemId) {
      return '';
    }

    if (domain === 'contact') {
      const contact = contacts.find((candidate) => candidate.id === editingItemId);
      if (!contact) {
        return '';
      }
      if (fieldId === 'firstName') {
        return contact.firstName;
      }
      if (fieldId === 'lastName') {
        return contact.lastName;
      }
      if (fieldId === 'email') {
        return contact.email;
      }
      if (fieldId === 'phone') {
        return contact.phone;
      }
      if (fieldId === 'address') {
        return contact.addressLine1;
      }
      // fieldId === 'favoriteBar'
      return contact.favoriteBarId
        ? (locations.find((location) => location.id === contact.favoriteBarId)?.name ?? '')
        : '';
    }

    if (domain === 'location') {
      const location = locations.find((candidate) => candidate.id === editingItemId);
      if (!location) {
        return '';
      }
      return fieldId === 'name' ? location.name : location.addressLine1;
    }

    const group = groups.find((candidate) => candidate.id === editingItemId);
    return group && fieldId === 'name' ? group.name : '';
  }

  function startEditField(domain: TDomainId, fieldId: TDomainFieldId) {
    setEditingDomainFieldId(fieldId);
    setReturningStage(null);

    const messages: string[] = [];
    const currentValue = getCurrentFieldValue(domain, fieldId).trim();
    if (currentValue) {
      messages.push(t('bartenderBotCurrentFieldValue', { value: currentValue }));
    }

    // Listing the bars tied to this account — the user picks by typing one of these names.
    if (domain === 'contact' && fieldId === 'favoriteBar' && locations.length > 0) {
      messages.push(
        t('bartenderBotFavoriteBarOptions', {
          names: locations.map((location) => location.name).join(', '),
        }),
      );
    }

    messages.push(currentValue ? t('bartenderBotAskEditField') : t(getEditFieldPromptKey(domain, fieldId)));

    showBotMessagesThen(messages, () => {
      setDraftValue('');
      setReturningStage('editFieldValue');
    });
  }

  function startEditMembers() {
    const group = groups.find((candidate) => candidate.id === editingItemId);
    setSelectedMemberIds(group ? group.contacts.map((member) => member.id) : []);
    setReturningStage(null);
    showBotMessageThen(t('bartenderBotGroupPickMembers'), () => setReturningStage('editMembersSelect'));
  }

  function applyEditFieldSelection(domain: TDomainId, fieldId: TDomainFieldId | 'done') {
    if (fieldId === 'done') {
      setEditingItemId(null);
      setEditingDomainFieldId(null);
      showDomainMenu();
      return;
    }

    if (domain === 'group' && fieldId === 'members') {
      startEditMembers();
    } else {
      startEditField(domain, fieldId);
    }
  }

  function handleEditMembersDone() {
    const group = groups.find((candidate) => candidate.id === editingItemId);
    if (!group || selectedMemberIds.length === 0) {
      return;
    }

    const members = contacts.filter((contact) => selectedMemberIds.includes(contact.id));
    pushMessage('user', members.map((member) => formatContactDisplayName(member)).join(', '));
    const updated = { ...group, contacts: members };
    updateGroup(updated);
    setReturningStage(null);
    finishFieldEdit(buildGroupInfoText(updated));
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
      () => showDomainMenu(),
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
    showBotMessageThen(t('bartenderBotLocationAdded', { name }), () => showDomainMenu());
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
    showBotMessageThen(t('bartenderBotGroupAdded', { name: groupNameDraft }), () => showDomainMenu());
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
      case 'editFieldValue': {
        if (!activeDomain || !editingDomainFieldId) {
          return null;
        }

        if (activeDomain === 'contact' && editingDomainFieldId === 'email') {
          return {
            fieldLabelKey: 'email',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            // Optional on a contact — blank clears it, same as the real form.
            isValid: (value) => value.trim() === '' || EMAIL_SCHEMA.safeParse(value.trim()).success,
            skippable: false,
          };
        }
        if (activeDomain === 'contact' && editingDomainFieldId === 'phone') {
          return {
            fieldLabelKey: 'phone',
            keyboardType: 'phone-pad',
            format: formatPhoneInput,
            isValid: (value) => value.trim() === '' || phoneDigits(value).length === PHONE_DIGIT_COUNT,
            skippable: false,
          };
        }
        if (activeDomain === 'contact' && editingDomainFieldId === 'address') {
          return {
            fieldLabelKey: 'addressLine1',
            autoCapitalize: 'words',
            // Optional on a contact, unlike a location's required addressLine1.
            isValid: () => true,
            skippable: false,
          };
        }
        if (activeDomain === 'contact' && editingDomainFieldId === 'favoriteBar') {
          return {
            fieldLabelKey: 'favoriteBar',
            autoCapitalize: 'words',
            isValid: (value) => value.trim().length > 0,
            skippable: false,
          };
        }

        const field = DOMAIN_EDIT_FIELDS[activeDomain].find(
          (candidate) => candidate.id === editingDomainFieldId,
        );
        if (!field) {
          return null;
        }
        return {
          fieldLabelKey: field.labelKey,
          autoCapitalize: 'words',
          isValid: (value) => value.trim().length > 0,
          skippable: false,
        };
      }
      case 'editPick':
        return {
          fieldLabelKey: 'bartenderBotEditPickFieldLabel',
          autoCapitalize: 'words',
          isValid: (value) => value.trim().length > 0,
          skippable: false,
        };
      case 'editFieldMenu':
        return {
          fieldLabelKey: 'bartenderBotEditFieldLabel',
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
      case 'editFieldValue': {
        const domain = activeDomain;
        const fieldId = editingDomainFieldId;
        const itemId = editingItemId;
        if (!domain || !fieldId || !itemId) {
          return;
        }

        if (domain === 'contact') {
          const current = contacts.find((candidate) => candidate.id === itemId);
          if (!current) {
            showEditFieldMenu();
            return;
          }

          if (fieldId === 'firstName' || fieldId === 'lastName') {
            const updatedFirstName = fieldId === 'firstName' ? value : current.firstName;
            const updatedLastName = fieldId === 'lastName' ? value : current.lastName;
            const isDuplicate = contacts.some(
              (candidate) =>
                candidate.id !== itemId &&
                contactNameKey(candidate.firstName, candidate.lastName) ===
                  contactNameKey(updatedFirstName, updatedLastName),
            );
            if (isDuplicate) {
              showBotMessageThen(
                t('bartenderBotContactNameTaken', { name: `${updatedFirstName} ${updatedLastName}` }),
                () => startEditField(domain, fieldId),
              );
              return;
            }
            const updated = { ...current, firstName: updatedFirstName, lastName: updatedLastName };
            updateContact(updated);
            finishFieldEdit(buildContactInfoText(updated));
            return;
          }
          if (fieldId === 'email') {
            const updated = { ...current, email: value };
            updateContact(updated);
            finishFieldEdit(buildContactInfoText(updated));
            return;
          }
          if (fieldId === 'phone') {
            const updated = { ...current, phone: value };
            updateContact(updated);
            finishFieldEdit(buildContactInfoText(updated));
            return;
          }
          if (fieldId === 'address') {
            const updated = { ...current, addressLine1: value };
            updateContact(updated);
            finishFieldEdit(buildContactInfoText(updated));
            return;
          }
          // fieldId === 'favoriteBar'
          const match = matchChatOption(
            locations.map((location) => ({ id: location.id, label: location.name })),
            value,
          );
          if (match === 'ambiguous') {
            showBotMessageThen(t('bartenderBotFavoriteBarAmbiguous'), () =>
              startEditField(domain, fieldId),
            );
            return;
          }
          if (!match) {
            showBotMessageThen(t('bartenderBotFavoriteBarNotFound'), () =>
              startEditField(domain, fieldId),
            );
            return;
          }
          const updated = { ...current, favoriteBarId: match.id };
          updateContact(updated);
          finishFieldEdit(buildContactInfoText(updated));
          return;
        }

        if (domain === 'location') {
          const current = locations.find((candidate) => candidate.id === itemId);
          if (!current) {
            showEditFieldMenu();
            return;
          }
          const updated = {
            ...current,
            name: fieldId === 'name' ? value : current.name,
            addressLine1: fieldId === 'address' ? value : current.addressLine1,
          };
          updateLocation(updated);
          finishFieldEdit(buildLocationInfoText(updated));
          return;
        }

        const current = groups.find((candidate) => candidate.id === itemId);
        if (!current) {
          showEditFieldMenu();
          return;
        }
        const updated = { ...current, name: fieldId === 'name' ? value : current.name };
        updateGroup(updated);
        finishFieldEdit(buildGroupInfoText(updated));
        return;
      }
      case 'editPick': {
        const domain = activeDomain;
        if (!domain) {
          return;
        }

        const match = matchChatOption(getDomainItemOptions(domain), value);

        if (match === 'ambiguous') {
          showBotMessageThen(t('bartenderBotEditPickAmbiguous'), () => {
            setDraftValue('');
            setReturningStage('editPick');
          });
          return;
        }

        if (!match) {
          showBotMessageThen(t('bartenderBotEditPickNotFound'), () => {
            setDraftValue('');
            setReturningStage('editPick');
          });
          return;
        }

        proceedToEditItem(domain, match.id);
        return;
      }
      case 'editFieldMenu': {
        const domain = activeDomain;
        if (!domain) {
          return;
        }

        // Literal shortcut called out in the prompt itself, alongside the usual label matching.
        if (value.trim().toLowerCase() === 'return') {
          applyEditFieldSelection(domain, 'done');
          return;
        }

        const match = matchChatOption(editFieldMenuOptions, value);

        if (match === 'ambiguous') {
          showBotMessageThen(t('bartenderBotEditFieldAmbiguous'), () => {
            setDraftValue('');
            setReturningStage('editFieldMenu');
          });
          return;
        }

        if (!match) {
          showBotMessageThen(t('bartenderBotEditFieldNotFound'), () => {
            setDraftValue('');
            setReturningStage('editFieldMenu');
          });
          return;
        }

        applyEditFieldSelection(domain, match.id as TDomainFieldId | 'done');
        return;
      }
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
  const domainMenuOptions: TChatOption[] = DOMAIN_ACTIONS.map((action) => ({
    id: action.id,
    label: t(action.labelKey),
  }));
  const emptyDomainMenuOptions: TChatOption[] = [
    { id: 'addNow', label: t('bartenderBotAddNow') },
    { id: 'backToMain', label: t('bartenderBotBackToMainMenu') },
  ];
  const editFieldMenuOptions: TChatOption[] = activeDomain
    ? [
        ...DOMAIN_EDIT_FIELDS[activeDomain].map((field) => ({
          id: field.id,
          label: t(field.labelKey),
        })),
        { id: 'done', label: t('bartenderBotEditDone') },
      ]
    : [];

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
      ) : returningStage === 'domainMenu' ? (
        <ChatOptionList colors={colors} onSelect={handleDomainMenuSelect} options={domainMenuOptions} />
      ) : returningStage === 'domainEmptyMenu' ? (
        <ChatOptionList
          colors={colors}
          onSelect={handleEmptyDomainMenuSelect}
          options={emptyDomainMenuOptions}
        />
      ) : returningStage === 'editMembersSelect' ? (
        <ChatMultiSelect
          colors={colors}
          doneLabel={t('done')}
          isDoneDisabled={selectedMemberIds.length === 0}
          onDone={handleEditMembersDone}
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

