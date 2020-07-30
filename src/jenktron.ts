import settings from 'electron-settings';
import { JenkinsHttp } from './jenkinsHttp/jenkinsHttp.class';
import { ContextMenuService } from './services/contextMenu/contextMenu.service';
import { PipelineService } from './services/pipeline/pipeline.service';
import { BrowserRenderer } from './views/browser/browserRenderer';
import { ConfigCmp } from './views/browser/config/cmps/config/configCmp.class';
import { Globals } from './views/browser/globals.class';
import { MainCmp } from './views/browser/main/main.view';
import { Router } from './views/browser/router.class';
import { jenkinsUrl, password, user } from './views/browser/shared';

export async function browserInit(): Promise<void> {
  new ContextMenuService().initDebug();
  const globals = new Globals();
  const router = new Router();
  const renderer = new BrowserRenderer();
  globals.router = router;
  globals.renderer = renderer;

  console.log(`Settings stored at: ${settings.file()}`);

  const _user = String(settings.getSync(user));
  const _password = String(settings.getSync(password));
  const _jenkinsUrl = String(settings.getSync(jenkinsUrl));

  if (_user && _password && _jenkinsUrl) {
    const jenkinsHttp = new JenkinsHttp(_user, _password, _jenkinsUrl);
    const pipelineService = new PipelineService(jenkinsHttp);
    globals.pipelineService = pipelineService;
    renderer.startLoading();

    try {
      const pipelines = await pipelineService.pipelineNames();
      globals.pipelines = pipelines;
    } catch (e) {
      alert(
        'Error getting data from jenkins. Are credentials correct? Is the tunnel open?'
      );
      new ConfigCmp();
    }

    new MainCmp();
  } else {
    new ConfigCmp();
  }
}
