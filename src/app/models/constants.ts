import { AreYouSureDialogConfig } from './dialog';

export const APP_NAME = 'Scorecard';

export const LOCAL_STORAGE_KEYS = {
  CURRENT_USER_ID: 'CURRENT_USER',
  ALL_USERS: 'ALL_USERS',
};

export const SESSION_STORAGE_KEYS = {
  DO_NOT_SHOW_PWA_PROMPT_AGAIN_THIS_SESSION: 'doNotShowInstallPrompt',
  OPEN_SIDENAV_ON_RELOAD: 'openSideNavOnReload',
  GO_TO_CHANGELOG: 'goToChangeLog',
};

export const APP_ROUTES = {
  PROFILES: 'profiles',
  COURSES: 'course-list',
  ADD_EDIT_COURSE: 'edit-course',
  ADD_EDIT_ROUND: 'edit-round',
  HOME: 'home',
  CLEAR_DATA: 'clear-data',
  ABOUT: 'about-this-app',
};

export const NAVIGATION_STATE_KEYS = {
  COURSE_ID_TO_EDIT: 'course-id-to-edit',
  ROUND_ID_TO_EDIT: 'round-id-to-edit',
  MESSAGE: 'message',
};

export const CLEAR_ALL_APP_DATA: AreYouSureDialogConfig = {
  title: 'Clear ALL App Data',
  message: 'Are you sure? This will clear ALL profiles.',
  confirmButtonText: 'Clear All',
  confirmButtonIcon: 'delete_forever',
  nonConfirmButtonText: 'Cancel',
  nonConfirmButtonIcon: 'cancel',
};

export const DELETE_PROFILE: AreYouSureDialogConfig = {
  title: 'Delete Profile',
  message:
    'Are you sure? This will clear ALL courses and rounds for this user.',
  confirmButtonText: 'Delete',
  confirmButtonIcon: 'delete',
  nonConfirmButtonText: 'Cancel',
  nonConfirmButtonIcon: 'cancel',
};

export const DELETE_ROUND: AreYouSureDialogConfig = {
  title: 'Delete Round',
  message: 'Are you sure? This action cannot be undone.',
  confirmButtonText: 'Delete',
  confirmButtonIcon: 'delete',
  nonConfirmButtonText: 'Cancel',
  nonConfirmButtonIcon: 'cancel',
};

export const DELETE_COURSE: AreYouSureDialogConfig = {
  title: 'Delete Course',
  message:
    'Are you sure? This will also delete ALL recorded rounds for this course.',
  confirmButtonText: 'Delete',
  confirmButtonIcon: 'delete',
  nonConfirmButtonText: 'Cancel',
  nonConfirmButtonIcon: 'cancel',
};

export const UNSAVED_DATA: AreYouSureDialogConfig = {
  title: 'Unsaved Data',
  message:
    'Are you sure you want to leave this page? Unsaved changes will be lost.',
  confirmButtonText: 'Leave',
  confirmButtonIcon: 'arrow_back',
  nonConfirmButtonText: 'Edit',
  nonConfirmButtonIcon: 'edit',
};
