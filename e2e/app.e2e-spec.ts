import { NkdWebPage } from './app.po';

describe('nkd-web App', () => {
  let page: NkdWebPage;

  beforeEach(() => {
    page = new NkdWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
