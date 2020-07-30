import { BaseCmp } from '../../../baseCmp.class';
import { HTML } from '../../../html.class';

export class GeneralLogCmp extends BaseCmp {
  constructor(data: any) {
    super();
    this.html = this.getLog(data);
  }

  public getLog(obj: any): HTML {
    let html = '';
    if (obj !== null && obj !== undefined) {
      const prototype = Object.getPrototypeOf(obj);
      if (
        prototype === String.prototype ||
        prototype === Number.prototype ||
        prototype === Boolean.prototype
      ) {
        html = `<pre>${obj}</pre>`;
      } else if (prototype === Array.prototype) {
        html = obj
          .map(
            (i) =>
              `<div class="log-pre boundary scroll-stop">${this.getLog(
                i
              )}</div>`
          )
          .join('');
      } else if (prototype === Map.prototype) {
        for (const [key, value] of obj.entries()) {
          html = `${html}
          <div class="log-pre boundary scroll-stop">
            <pre>${key}</pre>
            <pre>${this.getLog(value)}</pre>
          </div>`;
        }
      } else {
        for (const key in obj) {
          html = `${html}
          <div class="log-pre boundary scroll-stop">
            <pre>${key}</pre>
            <pre>${this.getLog(obj[key])}</pre>
          </div>`;
        }
      }
    }

    return new HTML(html);
  }
}
