const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getAppName = () => {
  if (IS_DEV) return "happybirthday(Dev)";
  if (IS_PREVIEW) return "happybirthday(Preview)";
  return "Happy Birthday";
};

const getBundleIdentifier = () => {
  if (IS_DEV) return "com.happybirthday.dev";
  if (IS_PREVIEW) return "com.happybirthday.preview";
  return "com.happybirthday";
};

module.exports = {
  expo: {
    name: getAppName(),
    slug: "happybirthday",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "happybirthday",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    runtimeVersion: {
      policy: "appVersion",
    },
    updates: {
      url: "https://u.expo.dev/c2e75737-4091-4ce7-a56a-f0fe29d50629",
      fallbackToCacheTimeout: 0,
      enabled: true,
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: getBundleIdentifier(),
      infoPlist: {
        UIBackgroundModes: ["remote-notification"],
        NSContactsUsageDescription: "This app uses contacts to help you manage birthdays.",
      },
      buildNumber: "1",
    },
    android: {
      package: getBundleIdentifier(),
      versionCode: 1,
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/icon.png",
        backgroundImage: "./assets/images/icon.png",
        monochromeImage: "./assets/images/icon.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: [
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.VIBRATE",
        "android.permission.SCHEDULE_EXACT_ALARM",
        "android.permission.USE_EXACT_ALARM",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.READ_CONTACTS",
      ],
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/icon.png",
          color: "#E6F4FE",
          sounds: [],
          mode: "production",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    notification: {
      icon: "./assets/images/icon.png",
      color: "#E6F4FE",
      androidMode: "default",
      androidCollapsedTitle: "Birthday Reminders",
    },
    extra: {
      eas: {
        projectId: "c2e75737-4091-4ce7-a56a-f0fe29d50629"
      },
    },
    owner: "shreevatsatg", // Replace with your Expo username
  },
};