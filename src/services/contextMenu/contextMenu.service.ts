/* eslint-disable @typescript-eslint/no-var-requires */
let rightClickPosition: { x: number; y: number } = undefined;
export class ContextMenuService {
  public menu;

  public initDebug(): void {
    const remote = require('electron').remote;
    const { Menu, MenuItem } = remote;
    this.menu = new Menu();
    this.menu.append(
      new MenuItem({
        label: 'Inspect Element',
        click() {
          remote
            .getCurrentWindow()
            .webContents.inspectElement(
              rightClickPosition.x,
              rightClickPosition.y
            );
        },
      })
    );
    this.menu.append(new MenuItem({ type: 'separator' }));

    window.addEventListener(
      'contextmenu',
      (e) => this.rightClickContextMenu(e),
      false
    );
  }

  public destroy(): void {
    window.removeEventListener('contextmenu', this.rightClickContextMenu);
  }

  private rightClickContextMenu(e) {
    e.preventDefault();
    rightClickPosition = { x: e.x, y: e.y };
    this.menu.popup();
  }
}
