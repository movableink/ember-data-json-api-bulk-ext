import Pretender from 'pretender';

export default function setupPretender(hooks) {
  hooks.beforeEach(function() {
    this.server = new Pretender();
  });

  hooks.afterEach(function() {
    this.server.shutdown();
  });
}
