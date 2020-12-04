import { action, autorun, makeAutoObservable } from "mobx";
import lib from "swf-lib";
import { Relay } from "../../../game/classes/john";
import { Key } from "../../../game/classes/john/Key";
import type { RootStore } from "./root";

export class RecorderStore {
  mode: "recording" | "replaying" | null = null;
  recording: number[] = [];
  replayIndex = 0;

  constructor(readonly root: RootStore) {
    makeAutoObservable(this);
    autorun(() => {
      const stage = this.root.game.stage;
      if (!stage) {
        return;
      }
      stage.__withContext(() =>
        stage.addEventListener(
          lib.flash.events.Event.EXIT_FRAME,
          this.exitFrame
        )
      )();
      return stage.__withContext(() =>
        stage.removeEventListener(
          lib.flash.events.Event.EXIT_FRAME,
          this.exitFrame
        )
      );
    });
  }

  skipToSPMenu() {
    const mt = this.root.game.instance;
    const stage = this.root.game.stage;
    if (!mt || !stage) {
      return;
    }

    stage.__withContext(() => {
      mt.gotoAndStop(3);
      mt.removeChild(mt.agIntro);
      mt.dispatchEvent(new Relay(Relay.GOTO, "endIntro", " "));
      mt.dispatchEvent(new Relay(Relay.GOTO, "MainMenu", "SinglePlayer"));
    })();
  }

  startSPGame(level: number) {
    const mt = this.root.game.instance;
    const stage = this.root.game.stage;
    if (!mt || !stage) {
      return;
    }

    stage.__withContext(() => {
      if (mt.multiplayer?.game?.mode === "SP") {
        mt.dispatchEvent(new Relay(Relay.GOTO, "Game", "SinglePlayerMenu"));
      }

      mt.playerObj.gameLevel = level;
      mt.playerObj.gameTime = 0;
      mt.dispatchEvent(new Relay(Relay.GOTO, "SinglePlayerMenu", "StartGame"));
    })();
  }

  private exitFrame = action(() => {
    switch (this.mode) {
      case "recording": {
        const shift =
          Key.isDown(lib.flash.ui.Keyboard.SPACE) ||
          Key.isDown(lib.flash.ui.Keyboard.SHIFT);
        const left = Key.isDown(Key.LEFT);
        const right = Key.isDown(Key.RIGHT);
        const up = Key.isDown(Key.UP);
        const down = Key.isDown(Key.DOWN);

        let keys = 0;
        if (shift) {
          keys |= 1;
        }
        if (left) {
          keys |= 2;
        }
        if (right) {
          keys |= 4;
        }
        if (up) {
          keys |= 8;
        }
        if (down) {
          keys |= 16;
        }
        this.recording.push(keys);
        break;
      }
      case "replaying": {
        if (this.replayIndex >= this.recording.length) {
          Key.keysDown = {};
          this.mode = null;
          return;
        }

        const keys = this.recording[this.replayIndex++];
        Key.keysDown = {};
        if (keys & 1) {
          Key.keysDown[lib.flash.ui.Keyboard.SPACE] = true;
        }
        if (keys & 2) {
          Key.keysDown[lib.flash.ui.Keyboard.LEFT] = true;
        }
        if (keys & 4) {
          Key.keysDown[lib.flash.ui.Keyboard.RIGHT] = true;
        }
        if (keys & 8) {
          Key.keysDown[lib.flash.ui.Keyboard.UP] = true;
        }
        if (keys & 16) {
          Key.keysDown[lib.flash.ui.Keyboard.DOWN] = true;
        }
        break;
      }
    }
  });
}
