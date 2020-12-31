import lib from "swf-lib";
import type { GamePlayerPosition } from "./Tubes";

export type ExternalEventProps =
  | { type: "sp-user-level" }
  | { type: "connect-multiplayer" }
  | { type: "disconnect-multiplayer" }
  | { type: "report-position"; position: GamePlayerPosition }
  | { type: "report-checkpoint"; id: number };

export class ExternalEvent extends lib.flash.events.Event {
  static readonly TYPE = "external-event";

  public constructor(readonly props: ExternalEventProps) {
    super(ExternalEvent.TYPE, true, false);
  }
}
