export interface Card {
  id: number;
  img: string;
  class: string;
  race: string;
  hp: number;
  dmg: number;
  atkType: AtkType;
}

type AtkType = "HELLO" | "BYE";