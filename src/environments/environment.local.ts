declare const process: {
  env: {
    PUBLIC_GOLF_COURSE_API_KEY: string;
  };
};

export const environment = {
  production: false,
  golfCourseApiKey: process.env.PUBLIC_GOLF_COURSE_API_KEY,
};
