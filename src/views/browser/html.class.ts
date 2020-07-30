export class HTML {
  public value: HTML;
  constructor(html: string | string[]) {
    if (Array.isArray(html)) {
      this.value = (html.join('').replace(/ +/gi, ' ') as unknown) as HTML;
      return this.value;
    } else {
      this.value = (html.replace(/ +/gi, ' ') as unknown) as HTML;
      return this.value;
    }
  }

  public toString(): string {
    return (this.value as unknown) as string;
  }
}
