/*
 * Sample thoughts that seed the wall on first visit.
 * `ago` is minutes before the first visit; `num` pins a few identifiers,
 * the rest are generated. Comment counts are always the real number of comments.
 */
window.Wall = window.Wall || {};

Wall.SEED = [
  {
    cat: "rant", ago: 120, num: 4821,
    text: "I genuinely hate when someone says “we need to talk” and refuses to say what it's about. just say it. I've already imagined 14 worse versions.",
    r: { heart: 42, cry: 6, laugh: 18, eyes: 9, skull: 4, hug: 2 },
    c: [
      "the “we need to talk” text at 11pm with no follow up is a crime",
      "my manager does this every friday afternoon 💀",
      "it's always something tiny too. like why did I lose sleep over this"
    ]
  },
  {
    cat: "random", ago: 55, num: 4567,
    text: "adulthood is the real definition of what i ordered vs what i got",
    r: { heart: 8, laugh: 21, skull: 12, cry: 5 },
    c: ["THIS 😭", "i ordered ‘thriving’ and got ‘pays bills on time sometimes’"]
  },
  {
    cat: "hottake", ago: 240, num: 7319,
    text: "Hot take: university group projects should be illegal.",
    r: { heart: 64, laugh: 31, skull: 22, eyes: 3 },
    c: [
      "Especially when nobody contributes 😭",
      "THIS.",
      "Mine is worse... the guy who did nothing presented our slides and got the highest grade",
      "counterpoint: they taught me i will do everyone's work for the rest of my life"
    ]
  },
  {
    cat: "confession", ago: 400,
    text: "I think I'm falling for my best friend and I'd rather lose the feeling than lose them.",
    r: { heart: 132, cry: 48, hug: 61, eyes: 20 },
    c: [
      "been there. the feeling passed eventually and we're still close. you'll be okay either way 🫂",
      "or... what if they feel the same",
      "this is the scariest kind of love honestly"
    ]
  },
  {
    cat: "confession", ago: 30,
    text: "I've been saying ‘on my way’ while still in bed for about six years now. nobody has caught on.",
    r: { laugh: 40, skull: 27, eyes: 11 },
    c: ["the audacity. respect.", "we all know btw"]
  },
  {
    cat: "hottake", ago: 700,
    text: "pineapple on pizza is fine. what's not fine is people making it their whole personality to hate it.",
    r: { laugh: 12, heart: 18, skull: 3, eyes: 7 },
    c: ["finally someone said it", "no."]
  },
  {
    cat: "confession", ago: 1440,
    text: "my mom still sets a plate for my dad on sundays. it's been two years. nobody says anything, we just eat.",
    r: { heart: 88, cry: 71, hug: 94 },
    c: [
      "i had to put my phone down for a second",
      "that's love. that's what it looks like.",
      "sending your family so much 🫂"
    ]
  },
  {
    cat: "random", ago: 90,
    text: "the guy at the gym who reracks everyone's weights is the only man I trust",
    r: { laugh: 36, heart: 22, skull: 8 },
    c: ["he's out there doing god's work"]
  },
  {
    cat: "rant", ago: 15,
    text: "Why do printers know when you're in a rush. Genuine question. Is it a feelings thing.",
    r: { laugh: 19, skull: 14, eyes: 2 },
    c: []
  },
  {
    cat: "confession", ago: 900,
    text: "I miss who I was before I started caring what everyone thought of me. she was loud and she was happy.",
    r: { heart: 77, hug: 39, cry: 22 },
    c: ["she's still in there", "same thing happened to me around 14. still trying to find him again"]
  },
  {
    cat: "hottake", ago: 1800,
    text: "‘let's circle back’ means we are never speaking of this again and everyone in the meeting knows it.",
    r: { laugh: 45, skull: 30, heart: 12 },
    c: ["corporate for ‘no’", "circle back is where ideas go to die"]
  },
  {
    cat: "random", ago: 3000,
    text: "I told a stranger on the bus that I liked her jacket and she started crying. I think about her every day. I hope she's okay.",
    r: { heart: 110, cry: 20, hug: 45, eyes: 6 },
    c: ["you might have saved her whole day", "small things aren't small"]
  },
  {
    cat: "rant", ago: 180,
    text: "my landlord raised the rent and then replaced the bathroom light with a smaller bulb. like a villain in a very sad cartoon.",
    r: { laugh: 28, skull: 25, cry: 9 },
    c: ["the smaller bulb is personal"]
  },
  {
    cat: "confession", ago: 50,
    text: "I have a whole speech ready for when my crush finally texts first. they have never texted first.",
    r: { cry: 33, laugh: 20, hug: 12, heart: 18 },
    c: ["the speech is probably so good too", "text first. lose the speech. live a little"]
  },
  {
    cat: "hottake", ago: 360,
    text: "voice notes over 2 minutes should come with a summary",
    r: { laugh: 24, heart: 30, skull: 6 },
    c: ["or a podcast intro"]
  },
  {
    cat: "random", ago: 600,
    text: "I laughed at my own joke in a job interview. alone. they did not laugh. I got the job though so maybe it was a test.",
    r: { laugh: 51, skull: 34, eyes: 4 },
    c: []
  },
  {
    cat: "random", ago: 10,
    text: "does anyone else rehearse conversations in the shower that will never happen",
    r: { heart: 20, eyes: 5, laugh: 9 },
    c: ["won every argument in there", "every single day"]
  },
  {
    cat: "confession", ago: 1200,
    text: "i'm 27 and i still don't know how to cook rice without looking it up",
    r: { laugh: 14, hug: 6, skull: 9 },
    c: []
  },
  {
    cat: "hottake", ago: 2000,
    text: "people who reply ‘k’ should have to pay a small fine",
    r: { laugh: 17, heart: 9, skull: 11 },
    c: ["k"]
  },
  {
    cat: "confession", ago: 240,
    text: "I cried in the grocery store today because they stopped selling the cereal my grandma used to buy me. it's just cereal. it's not just cereal.",
    r: { cry: 40, hug: 55, heart: 60 },
    c: ["it's never just the cereal 🫂"]
  },
  {
    cat: "rant", ago: 75,
    text: "my roommate eats my food and then leaves ONE bite so it's technically not finished. psychological warfare.",
    r: { laugh: 31, skull: 29 },
    c: ["the one bite is a message", "label everything. trust no one."]
  },
  {
    cat: "random", ago: 4000,
    text: "I think we're all just pretending to know what we're doing and it's working surprisingly okay",
    r: { heart: 70, laugh: 10, hug: 14 },
    c: []
  },
  {
    cat: "hottake", ago: 130,
    text: "sleeping with socks on is correct and I will not be taking questions.",
    r: { laugh: 8, skull: 5, eyes: 2, heart: 6 },
    c: ["socks off. forever. fight me."]
  },
  {
    cat: "rant", ago: 5,
    text: "the fact that I have to be emotionally available AND remember my passwords is too much",
    r: { laugh: 7, heart: 3 },
    c: []
  },
  {
    cat: "random", ago: 2,
    text: "3am thought: somewhere someone is reading this and we'll never meet. hi.",
    r: { heart: 4, eyes: 3, hug: 2 },
    c: []
  },
  {
    cat: "confession", ago: 1500,
    text: "I lied about having read the book in book club. for four months. I am now the book club leader.",
    r: { laugh: 60, skull: 45, eyes: 12 },
    c: ["this is how every leader rises honestly", "what are you reading next month 👀"]
  },
  {
    cat: "confession", ago: 2600,
    text: "i've been pretending to like coffee for 3 years because everyone at work bonds over it",
    r: { laugh: 13, skull: 6, hug: 3 },
    c: []
  },
  {
    cat: "rant", ago: 4500,
    text: "why is it that the moment I finally feel like I have my life together, my phone breaks",
    r: { cry: 8, laugh: 6 },
    c: []
  },
  {
    cat: "hottake", ago: 5200,
    text: "saying ‘no worries!’ when there were, in fact, worries, is a form of self-sabotage",
    r: { laugh: 20, heart: 25, cry: 4, skull: 6 },
    c: ["no worries! (there were many)"]
  },
  {
    cat: "confession", ago: 20,
    text: "my ex liked a photo from 2019 at 2am. I'm not reading into it. I'm reading into it.",
    r: { eyes: 38, skull: 22, laugh: 15 },
    c: [
      "accidental thumb or 2am regret, no in between 👀",
      "block. heal. thrive.",
      "oh you're definitely reading into it"
    ]
  }
];
