import { AreYouSureDialogConfig } from "./dialog";

export const APP_NAME = 'Scorecard';

export const STORAGE_KEYS = {
  CURRENT_USER_ID: 'CURRENT_USER',
  ALL_USERS: 'ALL_USERS',
};

export const APP_ROUTES = {
  PROFILES: 'profiles',
  COURSES: 'course-list',
  ADD_EDIT_COURSE: 'edit-course',
  ADD_EDIT_ROUND: 'edit-round',
  HOME: 'home',
  CLEAR_DATA: 'clear-data',
};

export const NAVIGATION_STATE_KEYS = {
  COURSE_ID_TO_EDIT: 'course-id-to-edit',
  ROUND_ID_TO_EDIT: 'round-id-to-edit',
};

export const CLEAR_ALL_APP_DATA: AreYouSureDialogConfig = {
  title:  'Clear ALL App Data',
  message: 'Are you sure? This will clear ALL profiles.',
  confirmButtonText: 'Clear All'
} 

export const DELETE_PROFILE: AreYouSureDialogConfig = {
  title:  'Delete Profile',
  message: 'Are you sure? This will clear ALL courses and rounds for this user.',
  confirmButtonText: 'Delete'
} 

export const DELETE_ROUND: AreYouSureDialogConfig = {
  title:  'Delete Round',
  message: 'Are you sure? This action cannot be undone.',
  confirmButtonText: 'Delete'
} 

export const DELETE_COURSE: AreYouSureDialogConfig = {
  title:  'Delete Course',
  message: 'Are you sure? This will also delete ALL recorded rounds for this course.',
  confirmButtonText: 'Delete'
} 
