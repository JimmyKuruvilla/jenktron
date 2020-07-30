import settings from 'electron-settings';
import { browserInit } from '../../../../../jenktron';
import { Route } from '../../../../route.class';
import { Action } from '../../../action.interface';
import { BaseCmp } from '../../../baseCmp.class';
import { HTML } from '../../../html.class';
import { NavView } from '../../../nav/nav.view';
import { $, click, jenkinsUrl, password, user, VoidFn } from '../../../shared';

export class ConfigCmp extends BaseCmp {
  public nav: NavView;
  public actions: Action[];
  constructor(initEffects: VoidFn[] = []) {
    super();

    this.nav = this.renderer.createNewNav();

    this.effects = [
      () => {
        $('#config button').addEventListener(click, this.setConfig.bind(this));
      },
      () => {
        $('#config #user').value = settings.getSync(user);
        $('#config #password').value = settings.getSync(password);
        $('#config #jenkinsUrl').value =
          settings.getSync(jenkinsUrl) || 'http://ci.miuinsights.com:9088';
      },
    ];

    this.router.register(new Route('settings', () => new ConfigCmp()));
    this.html = this.createConfig();
    this.renderer.composer([this]);
    initEffects.forEach((e) => e());
    this.renderer.endLoading();

    return this;
  }

  public get user(): string {
    return $(`#${user}`).value;
  }

  public get password(): string {
    return $(`#${password}`).value;
  }

  public get jenkinsUrl(): string {
    return $(`#${jenkinsUrl}`).value;
  }

  public setConfig(): void {
    if ($('#config form').reportValidity()) {
      settings.setSync(jenkinsUrl, this.jenkinsUrl);
      settings.setSync(user, this.user);
      settings.setSync(password, this.password);
      browserInit();
    }
  }

  public createConfig(): HTML {
    return new HTML(`
    <div id="config" class="scroll-stop boundary">
      <form>
        <label>User Name
          <input id="${user}" type="text" required></input>
        </label>
        <label>Password/Token
          <input id="${password}" type="password" required></input>
        </label>
        <label>Jenkins Url
          <input id="${jenkinsUrl}" type="text" required></input>
        </label>
        <button>SAVE</submit>
      </form>
    </div>
    `);
  }
}
