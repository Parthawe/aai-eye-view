'use strict';

const marathiCopy = {
  brand: "आई",
  viewerNav: "दृश्य",
  storyNav: "गोष्ट",
  dedication: "आईसाठी",
  titleFirst: "दोन डोळ्यांतून",
  titleSecond: "दिसणारं जग",
  intro: "धूसरपणा आणि काळा डाग यांमुळे एकच दृश्य दोन्ही डोळ्यांना कसं वेगळं दिसतं, ते पाहा.",
  viewerIndex: "०१ / दृश्य",
  viewerTitle: "एकच दृश्य, शेजारी शेजारी",
  leftEye: "डावा डोळा",
  rightEye: "उजवा डोळा",
  leftBlur: "डाव्या डोळ्याचा धूसरपणा",
  rightBlur: "उजव्या डोळ्याचा धूसरपणा",
  blurMin: "० स्पष्ट",
  blurMax: "५ काहीच दिसत नाही",
  cameraNote: "कॅमेरा वापरणं ऐच्छिक आहे. व्हिडिओ याच टॅबमध्ये राहतो.",
  spotSize: "डागाचा आकार",
  spotSizeMin: "०% डाग नाही",
  spotSizeMax: "१००% पूर्ण रुंदी",
  spotDarkness: "डागाचा काळेपणा",
  spotDarknessMin: "०% पारदर्शक",
  spotDarknessMax: "१००% मध्यभाग पूर्ण काळा",
  spotSide: "काळा डाग कोणत्या डोळ्यात?",
  progression: "डागाचे नमुने",
  presetNone: "डाग नाही",
  presetSubtle: "फिकट",
  presetNoticeable: "ठळक",
  presetStronger: "अधिक गडद",
  glasses: "चष्मा",
  off: "चष्म्याशिवाय",
  on: "चष्म्यासह",
  focusHint: "चष्म्यामुळे स्पष्टतेत होणारा छोटा फरक पाहा.",
  viewNote: "ही दृश्यं दोन्ही डोळ्यांतील फरक समजून घेण्यासाठी आहेत. यातून एखाद्या व्यक्तीला नेमकं काय दिसतं किंवा तिची दृष्टी पुढे कशी बदलेल, हे कळत नाही. नमुन्यांमधून डागाचा परिणाम किती कमी किंवा जास्त असू शकतो ते पाहता येतं.",
  storyIndex: "०२ / गोष्ट",
  storyTitle: "आईसाठी",
  letter: "आई, तुला दिसणाऱ्या दृश्याच्या मधोमध काळा डाग दिसतो असं तू सांगितलंस. तुला ते कसं जाणवतं, हे समजून घ्यावंसं वाटलं म्हणून हे बनवलं. आपण दोघं मिळून हे पाहू आणि यातलं काय तुझ्या अनुभवासारखं वाटतं, त्याबद्दल बोलू.",
  viewerQuestion: "या दृश्यातून काय समजतं?",
  visionSource: "राष्ट्रीय नेत्र संस्था: कमी दृष्टी (इंग्रजीत)",
  glassesQuestion: "चष्म्यामुळे काय बदलतं?",
  glassesSource: "राष्ट्रीय नेत्र संस्था: प्रकाश केंद्रित होण्यातील दोष (इंग्रजीत)",
  changeQuestion: "दृष्टीत बदल झाला आहे का, हे कसं कळेल?",
  changeAnswer: "नेत्रतज्ज्ञांना विचारा: नेमकं निदान काय आहे, कोणत्या डोळ्याला त्रास आहे, इंजेक्शन कशासाठी दिलं जातं आणि आधीच्या तपासण्यांच्या तुलनेत दृष्टीत किंवा तपासणीच्या निष्कर्षांत काही बदल आहे का? डोळा लाल होण्यासोबत दृष्टीही कमी झाली, विशेषतः इंजेक्शननंतर, तर काय करायचं तेही विचारा. या प्रश्नांची उत्तरं इथल्या दृश्यातून मिळत नाहीत.",
  privacy: "कॅमेरा आणि गोपनीयता",
  privacyAnswer: "कॅमेऱ्याचं बटण दाबून परवानगी दिल्यावरच कॅमेरा सुरू होतो. व्हिडिओवरची प्रक्रिया याच टॅबमध्ये होते. साइट व्हिडिओ रेकॉर्ड किंवा अपलोड करत नाही आणि मायक्रोफोनची परवानगी मागत नाही. चित्रातल्या दृश्याकडे परत जाण्यासाठी “कॅमेरा बंद करा” दाबा.",
  footer: "आई · आईसाठी",
  viewerAnswer: "दृष्टीच्या मध्यभागी जिथे दिसत नाही, त्या भागाला ‘सेंट्रल स्कोटोमा’ म्हणतात. मध्यभागची दृष्टी बदलली तर समोरचा शब्द वाचायला किंवा थेट पाहत असलेला चेहरा ओळखायला कठीण जाऊ शकतं. हे दाखवण्यासाठी डाग चित्राच्या मधोमध ठेवला आहे. तुम्ही कुठे पाहत आहात, हे पान टिपत नाही.",
  glassesAnswer: "डोळ्यात प्रकाश नीट केंद्रित न झाल्यामुळे धूसर दिसत असेल, तर चष्म्याने ते सुधारू शकतं. चष्म्याचा पर्याय निवडल्यावर दोन्ही दृश्यांच्या स्पष्टतेतला छोटा फरक पाहता येतो.",
};

const localized = {
  en: {
    home: 'Aai home',
    mainNav: 'Main',
    languageLabel: 'Site language',
    title: 'Aai | A view through two eyes',
    description: 'A tribute to Mom and an interactive illustration of a change in central vision.',
    blur: ['Sharp focus', 'Slight blur', 'Moderate blur', 'Strong blur', 'Heavy blur', 'No scene detail'],
    darkSpot: 'dark spot',
    blurValue: (level, max, description) => level + ' of ' + max + ', ' + description,
    sizeValue: percent => percent + ' of the view width',
    darknessValue: percent => percent + ' darkness',
    eyeDescription: (eye, view, glasses) => eye + ': ' + view + '. Glasses ' + (glasses ? 'on.' : 'off.'),
    useCamera: 'Use my camera',
    cancelCamera: 'Cancel camera',
    stopCamera: 'Stop camera',
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
    description: 'आईसाठी केलेली ही साइट दृष्टीच्या मध्यभागात बदल झाल्यावर कसं दिसू शकतं, हे दाखवते.',
    blur: ['स्पष्ट दृश्य', 'किंचित धूसर', 'बऱ्यापैकी धूसर', 'खूप धूसर', 'अतिशय धूसर', 'काहीच दिसत नाही'],
    darkSpot: 'काळा डाग',
    blurValue: (level, max, description) => max + ' पैकी ' + level + ', ' + description,
    sizeValue: percent => 'दृश्याच्या रुंदीच्या ' + percent,
    darknessValue: percent => percent + ' काळेपणा',
    eyeDescription: (eye, view, glasses) => eye + ': ' + view + '. ' + (glasses ? 'चष्म्यासह.' : 'चष्म्याशिवाय.'),
    useCamera: 'माझा कॅमेरा वापरा',
    cancelCamera: 'कॅमेरा सुरू करणं रद्द करा',
    stopCamera: 'कॅमेरा बंद करा',
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
