export type Language = 'en' | 'es';

export const defaultLanguage: Language = 'en';

export const languageOptions: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
];

const en = {
  appName: 'The Bar Signal',
  welcomeTo: 'Welcome to',
  activateBarSignal: 'Activate Bar Signal',
  navHome: 'Home',
  navContacts: 'My Contacts',
  navGroups: 'My Groups',
  navLocations: 'My Locations',
  navSettings: 'Settings',
  noContacts: 'No contacts yet',
  noGroups: 'No groups yet',
  noLocations: 'No locations yet',
  calledTimes: 'Called {{count}} {{times}}',
  time: 'time',
  times: 'times',
  favoriteOf: 'Favorite of {{count}} {{contacts}}',
  contact: 'contact',
  contacts: 'contacts',
  appearance: 'Appearance',
  darkMode: 'Dark mode',
  lightMode: 'Light mode',
  language: 'Language',
  themeHint: 'Theme applies across the app. Saving comes later.',
  languageHint: 'Language applies across the app. Saving comes later.',
  selectGroup: 'Group',
  selectLocation: 'Location',
  chooseGroup: 'Choose a group',
  chooseLocation: 'Choose a location',
  firstName: 'First name',
  lastName: 'Last name',
  nickname: 'Nickname',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  favoriteBar: 'Favorite bar',
  none: 'None',
  editContact: 'Edit contact',
  deleteContact: 'Delete contact',
  save: 'Save',
  cancel: 'Cancel',
  close: 'Close',
  second: 'second',
  seconds: 'seconds',
  minute: 'minute',
  minutes: 'minutes',
  travelTimer: 'Travel time',
  headingTo: '{{group}} → {{location}}',
  cancelSignalTitle: 'Stop the bar call?',
  cancelSignalMessage:
    'This will cancel the signal and stop tracking travel time for this group.',
  keepSignal: 'Keep going',
  stopSignal: 'Stop call',
  whoIsComing: 'Who is on the way',
  onTheWay: 'On the way',
  createContact: 'Create contact',
  createGroup: 'Create group',
  create: 'Create',
  groupName: 'Group name',
  selectMembers: 'Select members',
};

export type TranslationKey = keyof typeof en;

const es: Record<TranslationKey, string> = {
  appName: 'The Bar Signal',
  welcomeTo: 'Bienvenido a',
  activateBarSignal: 'Activar Bar Signal',
  navHome: 'Inicio',
  navContacts: 'Mis Contactos',
  navGroups: 'Mis Grupos',
  navLocations: 'Mis Ubicaciones',
  navSettings: 'Ajustes',
  noContacts: 'Aún no hay contactos',
  noGroups: 'Aún no hay grupos',
  noLocations: 'Aún no hay ubicaciones',
  calledTimes: 'Llamado {{count}} {{times}}',
  time: 'vez',
  times: 'veces',
  favoriteOf: 'Favorito de {{count}} {{contacts}}',
  contact: 'contacto',
  contacts: 'contactos',
  appearance: 'Apariencia',
  darkMode: 'Modo oscuro',
  lightMode: 'Modo claro',
  language: 'Idioma',
  themeHint: 'El tema se aplica en toda la app. Guardar llega después.',
  languageHint: 'El idioma se aplica en toda la app. Guardar llega después.',
  selectGroup: 'Grupo',
  selectLocation: 'Ubicación',
  chooseGroup: 'Elige un grupo',
  chooseLocation: 'Elige una ubicación',
  firstName: 'Nombre',
  lastName: 'Apellido',
  nickname: 'Apodo',
  email: 'Correo',
  phone: 'Teléfono',
  address: 'Dirección',
  favoriteBar: 'Bar favorito',
  none: 'Ninguno',
  editContact: 'Editar contacto',
  deleteContact: 'Eliminar contacto',
  save: 'Guardar',
  cancel: 'Cancelar',
  close: 'Cerrar',
  second: 'segundo',
  seconds: 'segundos',
  minute: 'minuto',
  minutes: 'minutos',
  travelTimer: 'Tiempo de viaje',
  headingTo: '{{group}} → {{location}}',
  cancelSignalTitle: '¿Detener la llamada al bar?',
  cancelSignalMessage:
    'Esto cancelará la señal y dejará de rastrear el tiempo de viaje de este grupo.',
  keepSignal: 'Seguir',
  stopSignal: 'Detener llamada',
  whoIsComing: 'Quién va en camino',
  onTheWay: 'En camino',
  createContact: 'Crear contacto',
  createGroup: 'Crear grupo',
  create: 'Crear',
  groupName: 'Nombre del grupo',
  selectMembers: 'Seleccionar miembros',
};

export const translations: Record<Language, Record<TranslationKey, string>> = {
  en,
  es,
};

export function translate(
  language: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>,
) {
  let value = translations[language][key] ?? translations.en[key];

  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{{${name}}}`, String(replacement));
    }
  }

  return value;
}
