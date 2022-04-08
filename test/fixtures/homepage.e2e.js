import { Selector } from 'testcafe'; // first import testcafe selectors

fixture `gui`;

const app = Selector('#app');

//then create a test and place your code there
test('myFirstTest', async t => {
    const nameInputElement = await app();
});
// .click('#submit-button')

// // Use the assertion to check if the actual header text is equal to the expected one
// .expect(Selector('#article-header').innerText).eql('Thank you, John Smith!');

//testcafe "electron:/home/sbrinckm/FZJ/PASTA/ReactElectron" "test/fixtures/*.js" -L