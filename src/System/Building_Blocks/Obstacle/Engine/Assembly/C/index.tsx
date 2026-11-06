export class CEngine {
  public static status = "Operational";
  public static malloc(bytes: number) { return new Uint8Array(bytes); }
}
