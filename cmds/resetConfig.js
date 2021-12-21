const { connectDB, mongoDB } = require("../mongodb.js");

module.exports.run = async (bot, message, args, guild) => {
  await connectDB();
  console.log(`Running command ${this.cmd.name} ${JSON.stringify(args)}`);

  let defaultConfig = {
    theme: "serika_dark",
    customTheme: false,
    customThemeColors: [
      "#323437",
      "#e2b714",
      "#e2b714",
      "#646669",
      "#d1d0c5",
      "#ca4754",
      "#7e2a33",
      "#ca4754",
      "#7e2a33",
    ],
    favThemes: [],
    showKeyTips: true,
    showLiveWpm: false,
    showTimerProgress: true,
    smoothCaret: true,
    quickTab: false,
    punctuation: false,
    numbers: false,
    words: 50,
    time: 30,
    mode: "time",
    quoteLength: [1],
    language: "english",
    fontSize: 15,
    freedomMode: false,
    resultFilters: null,
    difficulty: "normal",
    blindMode: false,
    quickEnd: false,
    caretStyle: "default",
    paceCaretStyle: "default",
    flipTestColors: false,
    layout: "default",
    funbox: "none",
    confidenceMode: "off",
    indicateTypos: false,
    timerStyle: "mini",
    colorfulMode: false,
    randomTheme: "off",
    timerColor: "main",
    timerOpacity: "1",
    stopOnError: "off",
    showAllLines: false,
    keymapMode: "off",
    keymapStyle: "staggered",
    keymapLegendStyle: "lowercase",
    keymapLayout: "overrideSync",
    fontFamily: "Roboto_Mono",
    smoothLineScroll: false,
    alwaysShowDecimalPlaces: false,
    alwaysShowWordsHistory: false,
    singleListCommandLine: "manual",
    capsLockWarning: true,
    playSoundOnError: false,
    playSoundOnClick: "off",
    startGraphsAtZero: true,
    swapEscAndTab: false,
    showOutOfFocusWarning: true,
    paceCaret: "off",
    paceCaretCustomSpeed: 100,
    repeatedPace: true,
    pageWidth: "100",
    chartAccuracy: true,
    chartStyle: "line",
    minWpm: "off",
    minWpmCustomSpeed: 100,
    highlightMode: "letter",
    alwaysShowCPM: false,
    enableAds: "off",
    hideExtraLetters: false,
    strictSpace: false,
    minAcc: "off",
    minAccCustom: 90,
    showLiveAcc: false,
    showLiveBurst: false,
    monkey: false,
    repeatQuotes: "off",
    oppositeShiftMode: "off",
    customBackground: "",
    customBackgroundSize: "cover",
    customBackgroundFilter: [0, 1, 1, 1, 1],
    customLayoutfluid: "qwerty#dvorak#colemak",
    monkeyPowerLevel: "off",
    minBurst: "off",
    minBurstCustomSpeed: 100,
    burstHeatmap: false,
    britishEnglish: false,
    lazyMode: false,
  };

  if (args.length !== 1) {
    return {
      status: false,
      message: ":x: Must provide one argument",
    };
  }

  let statusmsg;

  const targetUser = message.mentions.users.first();
  const discordId = targetUser.id;

  statusmsg = await message.channel.send(`:thinking: Accessing database...`);
  let docs = await mongoDB().collection("users").find({ discordId }).toArray();
  if(docs.length === 0) {
    await statusmsg.delete();
    return {
      status: false,
      message: `:x: User not found.`,
    };
  }else if (docs.length === 1) {
    await statusmsg.edit(`:thinking: User Found...`);
    const uid = docs[0].uid;
    await statusmsg.edit(`:thinking: Resetting config...`);
    await mongoDB()
      .collection("configs")
      .updateOne({ uid }, { $set: { config: defaultConfig } }, { upsert: true });
    await statusmsg.delete();
    return {
      status: true,
      message: `:white_check_mark: Done`,
    };
  }else if (docs.length > 1) {
    await statusmsg.delete();
    return {
      status: true,
      message: `:x: Multiple users found.`,
    };
  }
};

module.exports.cmd = {
  name: "resetconfig",
  needMod: true,
};
