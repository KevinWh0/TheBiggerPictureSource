import { voiceActingEnabled } from "../index.js";
import {
  isSpeaking,
  levelOn,
  levelPresense,
  narration,
  setLevel,
  setLevelPresense,
  setLoadingLevel,
  sounds,
} from "./assetManager.js";
import { getLevelPath } from "./levelManager.js";
import { loadLvl } from "./mapRenderer.js";
import {
  width,
  height,
  textWraped,
  fill,
  rectOutline,
  setFontSize,
  mousePressed,
  text,
  centerText,
  keyPressed,
  keyPushed,
  readTextFile,
  game,
  loadWorld,
  rect,
  keyReleased,
  getTextWidth,
  isPlaying,
  vibrate,
} from "./toolbox.js";
//2000 = about 20 secs
let speechDelay = 20000;

let speechLetterTicker = 0;

let dialogue;
let speaking = false;
(async () => {
  readTextFile("./assets/voiceLines/Script.json").then((result) => {
    dialogue = JSON.parse(result.replace(/↵/, ""));
  });
})();

export function resetSpeechLetterTicker() {
  speechLetterTicker = game.frameNo;
}

let yOffset = -50;
export function Speak(name, text) {
  fill("white");
  rect(20, height - height / 4 + yOffset, width - 40, height / 4 - 20, 2);
  fill("black");
  setFontSize(width / 50, "VT323");
  textWraped(name, 25, height - height / 4 - 10 + yOffset, width - 40, 20);
  rectOutline(
    20,
    height - height / 4 + yOffset,
    width - 40,
    height / 4 - 20,
    2
  );
  textWraped(
    text.substr(0, -(speechLetterTicker - game.frameNo)),
    45,
    height - height / 4 + 45 + yOffset,
    width - 80,
    width / 30
  );
  setFontSize(width / 60, "VT323");

  textWraped(
    "Press ENTER to continue...",
    width - 20 - getTextWidth("Press ENTER to continue..."),
    height + yOffset - 25,
    1000,
    20
  );
}

let speachOn = 0;
export function resetSpeachOn() {
  speachOn = 0;
}
let speech;
//Speak("???", speach[speachOn]);

export function resetDelay() {
  if (levelPresense == "main") {
    if (speachOn < speech.length - 1)
      setTimeout(function () {
        speaking = true;
        resetSpeechLetterTicker();
      }, speechDelay);
  } else {
    setTimeout(function () {
      speaking = true;
      resetSpeechLetterTicker();
    }, 0);
  }
}

export function stopSpeaking() {
  try {
    narration[`${levelOn}-${levelPresense}-${speachOn}`].pause();
    narration[`${levelOn}-${levelPresense}-${speachOn}`].currentTime = 0;
  } catch (err) {}
  lastLevel = levelOn;
  lastLvlSection = speachOn;
  lastLevelPresense = levelPresense;
}
let teleporting = false;
let playedPortalSound = false;

let lastPlayed = "";

//QUICKFIX VARS
let lastLevel = 0,
  lastLvlSection = -1,
  lastLevelPresense = "";

export function runDialogue() {
  speech = dialogue[`Level ${levelOn + 1}`][levelPresense];
  try {
    if (
      !isPlaying(narration[`${levelOn}-${levelPresense}-${speachOn}`]) &&
      lastPlayed != `${levelOn}-${levelPresense}-${speachOn}` &&
      speaking &&
      !isSpeaking() /*Dont Speak if a line from before is being said */
    ) {
      if (voiceActingEnabled) {
        //Quickfix
        if (
          levelOn >= lastLevel &&
          (lastLvlSection < speachOn ||
            levelOn > lastLevel ||
            lastLevelPresense != levelPresense)
        ) {
          narration[`${levelOn}-${levelPresense}-${speachOn}`].play();
          console.log(`PLAYING: ${levelOn}-${levelPresense}-${speachOn}`);
        }
      }
      lastPlayed = `${levelOn}-${levelPresense}-${speachOn}`;
    }
  } catch (error) {
    //console.log(`${levelOn}-${levelPresense}-${speachOn}`);
  }

  //speech.push("");
  if (speaking == true && !teleporting) {
    Speak("Dr. Scheer", speech[speachOn]);
    //speachOn++;

    if (mousePressed || (keyReleased && keyPressed == 13)) {
      try {
        narration[`${levelOn}-${levelPresense}-${speachOn}`].pause();
        narration[`${levelOn}-${levelPresense}-${speachOn}`].currentTime = 0;
      } catch (err) {}
      lastLevel = levelOn;
      lastLvlSection = speachOn;
      lastLevelPresense = levelPresense;

      speachOn++;
      console.log(`${levelOn}-${levelPresense}-${speachOn}`);

      resetSpeechLetterTicker();
      if (speachOn > speech.length - 1) {
        speachOn = 0;
        switch (levelPresense) {
          case "start":
            setLevelPresense("main");
            break;
          case "main":
            //setLevelPresense("pass");
            break;
          case "pass":
            if (!playedPortalSound) {
              vibrate(2200, 200);
              teleporting = true;
              sounds.portal.play();
              setTimeout(function () {
                setLevelPresense("start");
                playedPortalSound = false;
                setLevel(levelOn + 1);
                setLoadingLevel(true);
                loadWorld(getLevelPath(levelOn)());
                teleporting = false;
              }, 3000);
            }
            playedPortalSound = true;

            break;
        }
      }
      speaking = false;
      resetDelay();
    }
  }
}
