import { initGameState, setRenderCallback } from './game';
import { renderAll, setPlayerInfo } from './ui';
import { loadGame } from './save';

declare const Gamplo: any;

setRenderCallback(renderAll);

async function init() {
  initGameState(null);

  if (typeof Gamplo !== 'undefined') {
    Gamplo.onReady(async () => {
      const player = Gamplo.getPlayer();
      if (player) {
        setPlayerInfo({ displayName: player.displayName, image: player.image });
      } else {
        setPlayerInfo(null);
      }

      const save = await loadGame();
      if (save) {
        initGameState(save);
      }

      try {
        const { width, height } = Gamplo.getViewport();
        const app = document.getElementById('app')!;
        app.style.width = width + 'px';
        app.style.height = height + 'px';
      } catch (e) {}

      Gamplo.onResize((width: number, height: number) => {
        const app = document.getElementById('app')!;
        app.style.width = width + 'px';
        app.style.height = height + 'px';
      });

      renderAll();
    });
  } else {
    renderAll();
  }
}

init();
