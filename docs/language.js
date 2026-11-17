'use strict';

const marathiCopy = {
  brand: "आई",
  info: "माहिती",
  viewerNav: "दृश्य",
  storyNav: "गोष्ट",
  viewerTitle: "तिला दिसणारं जग",
  adjustView: "बदला",
  rotatePhone: "मोठं दृश्य पाहण्यासाठी फोन आडवा करा.",
  rotateExpanded: "मोठं दृश्य पाहण्यासाठी फोन आडवा करा.",
  leftEye: "डावा डोळा",
  rightEye: "उजवा डोळा",
  leftBlur: "डाव्या डोळ्याचा धूसरपणा",
  rightBlur: "उजव्या डोळ्याचा धूसरपणा",
  blurMin: "० स्पष्ट",
  blurMax: "५ काहीच दिसत नाही",
  cameraNote: "व्हिडिओ तुमच्या फोनवरच राहतो.",
  spotSize: "काळ्या भागाची रुंदी",
  spotSizeMin: "०% काळा भाग नाही",
  spotSizeMax: "१००% पूर्ण रुंदी",
  spotDarkness: "काळेपणा",
  spotDarknessMin: "०% पारदर्शक",
  spotDarknessMax: "१००% पूर्ण काळा",
  spotSide: "काळा भाग कोणत्या डोळ्यात?",
  pattern: "काळ्या भागाचा आकार",
  rightEdge: "उजव्या कडेपासून",
  round: "गोल डाग",
  progression: "वेगवेगळे नमुने",
  presetNone: "काळा भाग नाही",
  presetSubtle: "फिकट",
  presetNoticeable: "ठळक",
  presetStronger: "अधिक गडद",
  glasses: "चष्मा",
  off: "चष्म्याशिवाय",
  on: "चष्म्यासह",
  focusHint: "स्पष्टतेतला फरक पाहा.",
  viewNote: "तिने सांगितलेल्या अनुभवावर आधारित दृश्य.",
  storyTitle: "आईसाठी",
  letter: "आईसाठी. तिला काय दिसतं, हे एकत्र समजून घेण्यासाठी.",
  viewerQuestion: "या दृश्यातून काय समजतं?",
  visionSource: "राष्ट्रीय नेत्र संस्था: कमी दृष्टी (इंग्रजीत)",
  glassesQuestion: "चष्म्यामुळे काय बदलतं?",
  glassesSource: "राष्ट्रीय नेत्र संस्था: प्रकाश केंद्रित होण्यातील दोष (इंग्रजीत)",
  changeQuestion: "दृष्टीत बदल झाला आहे का, हे कसं कळेल?",
  changeAnswer: "दृष्टीतले बदल समजण्यासाठी नेत्रतज्ज्ञ आधीच्या तपासण्यांशी तुलना करू शकतात.",
  privacy: "कॅमेरा आणि गोपनीयता",
  privacyAnswer: "तुमच्या परवानगीने कॅमेरा सुरू होतो. व्हिडिओ याच टॅबमध्ये राहतो. रेकॉर्डिंग, अपलोड किंवा मायक्रोफोनचा वापर होत नाही.",
  footer: "आई · आईसाठी",
  viewerAnswer: "डावं दृश्य धूसरपणापासून काळोखाकडे जातं. कॅमेरा वापरा आणि फिकट किंवा अधिक गडद नमुना निवडा.",
  glassesAnswer: "चष्म्याचा पर्याय दृश्य थोडं स्पष्ट करतो.",
};

const localized = {
  en: {
    home: 'Aai home',
    mainNav: 'Main',
    languageLabel: 'Site language',
    title: 'Aai | A view through two eyes',
    description: 'A tribute to Mom and an interactive illustration of how vision can differ between two eyes.',
    blur: ['Sharp focus', 'Slight blur', 'Moderate blur', 'Strong blur', 'Heavy blur', 'No scene detail'],
    darkSpot: 'Dark spot',
    rightDark: 'Right side dark',
    blurValue: (level, max, description) => level + ' of ' + max + ', ' + description,
    sizeValue: percent => percent + ' of the view width',
    darknessValue: percent => percent + ' darkness',
    eyeDescription: (eye, view, glasses) => eye + ': ' + view + '. Glasses ' + (glasses ? 'on.' : 'off.'),
    useCamera: 'Use my camera',
    cancelCamera: 'Cancel camera',
    stopCamera: 'Stop camera',
    fullScreen: 'Full screen',
    exitFullScreen: 'Exit full screen',
    illustrated: 'Illustrated scene',
    illustrationFailed: 'Illustrated scene could not load. You can still try your camera.',
    unavailableBrowser: 'This browser doesn’t provide camera access.',
    secureCamera: 'Open the HTTPS site to use your camera.',
    permission: 'Waiting for camera permission…',
    starting: 'Starting camera…',
    liveCamera: 'Live camera · Both views use the same feed',
    disconnected: 'Camera disconnected. Showing the illustrated scene.',
    denied: 'Camera blocked. Allow access in your browser to try again.',
    notFound: 'No camera found. You can use the illustrated scene.',
    busy: 'Camera unavailable. Close other apps using it and try again.',
    cameraFailed: 'Couldn’t start the camera. Showing the illustrated scene.',
  },
  mr: {
    home: 'आईचे मुख्यपृष्ठ',
    mainNav: 'मुख्य दुवे',
    languageLabel: 'साइटची भाषा',
    title: 'आई | दोन डोळ्यांतून दिसणारं जग',
    description: 'आईसाठी केलेली ही साइट दोन्ही डोळ्यांना एकच दृश्य कसं वेगळं दिसू शकतं, हे दाखवते.',
    blur: ['स्पष्ट दृश्य', 'किंचित धूसर', 'बऱ्यापैकी धूसर', 'खूप धूसर', 'अतिशय धूसर', 'काहीच दिसत नाही'],
    darkSpot: 'काळा डाग',
    rightDark: 'उजवी बाजू काळी',
    blurValue: (level, max, description) => max + ' पैकी ' + level + ', ' + description,
    sizeValue: percent => 'दृश्याच्या रुंदीच्या ' + percent,
    darknessValue: percent => percent + ' काळेपणा',
    eyeDescription: (eye, view, glasses) => eye + ': ' + view + '. ' + (glasses ? 'चष्म्यासह.' : 'चष्म्याशिवाय.'),
    useCamera: 'माझा कॅमेरा वापरा',
    cancelCamera: 'कॅमेरा सुरू करणं रद्द करा',
    stopCamera: 'कॅमेरा बंद करा',
    fullScreen: 'पूर्ण स्क्रीन',
    exitFullScreen: 'पूर्ण स्क्रीनमधून बाहेर पडा',
    illustrated: 'चित्रातलं दृश्य',
    illustrationFailed: 'चित्र लोड झालं नाही. तुम्ही कॅमेरा वापरून पाहू शकता.',
    unavailableBrowser: 'या ब्राउझरमधून कॅमेरा वापरता येत नाही.',
    secureCamera: 'कॅमेरा वापरण्यासाठी साइटची सुरक्षित (HTTPS) लिंक उघडा.',
    permission: 'कॅमेऱ्याच्या परवानगीची वाट पाहत आहोत…',
    starting: 'कॅमेरा सुरू होत आहे…',
    liveCamera: 'कॅमेरा सुरू आहे. दोन्ही दृश्यांसाठी एकच व्हिडिओ वापरला जातो.',
    disconnected: 'कॅमेऱ्याचा संपर्क तुटला. आता चित्रातलं दृश्य दिसत आहे.',
    denied: 'कॅमेऱ्याची परवानगी मिळाली नाही. ब्राउझरमध्ये परवानगी देऊन पुन्हा प्रयत्न करा.',
    notFound: 'कॅमेरा सापडला नाही. तुम्ही चित्रातलं दृश्य पाहू शकता.',
    busy: 'कॅमेरा सध्या वापरता येत नाही. कॅमेरा वापरणारे इतर अॅप्स बंद करून पुन्हा प्रयत्न करा.',
    cameraFailed: 'कॅमेरा सुरू करता आला नाही. आता चित्रातलं दृश्य दिसत आहे.',
  },
};

const copyNodes = [...document.querySelectorAll('[data-copy]')];
const englishCopy = Object.fromEntries(copyNodes.map(node => [node.dataset.copy, node.textContent]));
const languageButtons = document.querySelectorAll('[data-language]');
const numberFormats = {
  en: new Intl.NumberFormat('en'),
  mr: new Intl.NumberFormat('mr-IN-u-nu-deva'),
};
let currentLanguage = 'en';

function copy(key) {
  return (currentLanguage === 'mr' ? marathiCopy : englishCopy)[key];
}

function number(value) {
  return numberFormats[currentLanguage].format(value);
}

function applyLanguage(language) {
  currentLanguage = language === 'mr' ? 'mr' : 'en';
  const words = localized[currentLanguage];
  document.documentElement.lang = currentLanguage;
  document.title = words.title;
  document.querySelector('meta[name=description]').content = words.description;
  for (const node of copyNodes) node.textContent = copy(node.dataset.copy);
  for (const node of document.querySelectorAll('[data-label]')) {
    node.setAttribute('aria-label', words[node.dataset.label]);
  }
  for (const toggle of languageButtons) {
    toggle.setAttribute('aria-pressed', String(toggle.dataset.language === currentLanguage));
  }
}
