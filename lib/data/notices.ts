

export interface Notice {
  id: string;
  tag: { en: string; ne: string };
  date: { en: string; ne: string };
  title: { en: string; ne: string };
  desc: { en: string; ne: string };
  content: { en: string; ne: string };
  image?: string;
  category: string;
}

export const notices: Notice[] = [
  { 
    id: 'dividend-2080',
    tag: { en: 'Urgent', ne: 'जरूरी' },
    date: { en: 'March 20, 2026', ne: 'चैत १०, २०८२' },
    title: { 
      en: 'Dividend distribution started for FY 2080/81', 
      ne: 'आर्थिक वर्ष २०८०/८१ को लाभांश वितरण सुरु' 
    },
    desc: { 
      en: 'All members are requested to bring their passbook for collection.', 
      ne: 'सदस्यहरूलाई लाभांश संकलन गर्न आफ्नो पासबुक ल्याउन अनुरोध गरिन्छ।' 
    },
    content: {
      en: 'We are pleased to announce that the dividend for the fiscal year 2080/81 is now being distributed. All share members are requested to visit their respective branch offices with their original passbooks and citizenship certificates for verification. The distribution will take place during regular office hours.',
      ne: 'हामी सहर्ष जानकारी गराउँछौं कि आर्थिक वर्ष २०८०/८१ को लाभांश अहिले वितरण भइरहेको छ। सबै शेयर सदस्यहरूलाई प्रमाणीकरणको लागि आफ्नो सक्कल पासबुक र नागरिकता प्रमाणपत्र सहित सम्बन्धित शाखा कार्यालयहरूमा सम्पर्क गर्न अनुरोध गरिन्छ। लाभांश वितरण कार्यालय समयमा हुनेछ।'
    },
    category: 'Urgent'
  },
  { 
    id: 'office-timing-summer',
    tag: { en: 'Normal', ne: 'सामान्य' },
    date: { en: 'March 18, 2026', ne: 'चैत ८, २०८२' },
    title: { 
      en: 'Office timing changed for Summer season', 
      ne: 'गर्मी मौसमका लागि कार्यालय समय परिवर्तन' 
    },
    desc: { 
      en: 'Our office will now open from 10:00 AM to 5:00 PM.', 
      ne: 'हाम्रो कार्यालय अब बिहान १०:०० देखि साँझ ५:०० सम्म खुल्नेछ।' 
    },
    content: {
      en: 'Due to the start of the summer season, the office operating hours have been adjusted for better service. Effective from tomorrow, all branches will be open from 10:00 AM to 5:00 PM, Sunday to Friday. Saturday will remain a holiday.',
      ne: 'गर्मी मौसम सुरु भएकोले सेवाग्राहीको सुविधाका लागि कार्यालय सञ्चालन समय परिवर्तन गरिएको छ। भोलिदेखि लागू हुने गरी सबै शाखाहरू आइतबारदेखि शुक्रबारसम्म बिहान १०:०० देखि साँझ ५:०० सम्म खुल्नेछन्। शनिबार सार्वजनिक बिदा रहनेछ।'
    },
    category: 'Normal'
  },
  { 
    id: 'staff-training-digital',
    tag: { en: 'Event', ne: 'कार्यक्रम' },
    date: { en: 'March 15, 2026', ne: 'चैत ५, २०८२' },
    title: { 
      en: 'Staff training program on Digital Banking', 
      ne: 'डिजिटल बैंकिङमा कर्मचारी प्रशिक्षण कार्यक्रम' 
    },
    desc: { 
      en: '3-day workshop for staff to enhance digital service delivery.', 
      ne: 'डिजिटल सेवा प्रवाह बढाउन कर्मचारीहरूका लागि ३ दिने कार्यशाला।' 
    },
    content: {
      en: 'A comprehensive 3-day staff training program on Digital Banking and Cyber Security is scheduled to start from next week. This initiative aims to equip our staff with the latest skills to provide better and more secure digital services to our members.',
      ne: 'डिजिटल बैंकिङ र साइबर सुरक्षा सम्बन्धी ३ दिने कर्मचारी प्रशिक्षण कार्यक्रम अर्को हप्तादेखि सुरु हुँदैछ। यो पहलको उद्देश्य हाम्रा कर्मचारीहरूलाई हाम्रा सदस्यहरूलाई अझ राम्रो र सुरक्षित डिजिटल सेवाहरू प्रदान गर्न नवीनतम सीपहरू प्रदान गर्नु हो।'
    },
    category: 'Events'
  },
  { 
    id: 'membership-online',
    tag: { en: 'Update', ne: 'अपडेट' },
    date: { en: 'March 12, 2026', ne: 'चैत २, २०८२' },
    title: { 
      en: 'Membership application now available online', 
      ne: 'सदस्यता आवेदन अब अनलाइन उपलब्ध छ' 
    },
    desc: { 
      en: 'New members can now apply through our official website.', 
      ne: 'नयाँ सदस्यहरूले अब हाम्रो आधिकारिक वेबसाइट मार्फत आवेदन दिन सक्छन्।' 
    },
    content: {
      en: 'In line with our digital transformation goals, we have launched the online membership application feature. Prospective members can now fill out the application form, upload necessary documents, and track their application status directly from our website.',
      ne: 'हाम्रो डिजिटल रूपान्तरणको लक्ष्य अनुसार, हामीले अनलाइन सदस्यता आवेदन सुविधा सुरु गरेका छौं। सम्भावित सदस्यहरूले अब आवेदन फारम भर्न, आवश्यक कागजातहरू अपलोड गर्न र आफ्नो आवेदन स्थिति सिधै हाम्रो वेबसाइटबाट ट्र्याक गर्न सक्छन्।'
    },
    category: 'Updates'
  },
  { 
    id: 'saving-deadline-chaitra',
    tag: { en: 'Important', ne: 'महत्वपूर्ण' },
    date: { en: 'March 10, 2026', ne: 'फागुन २८, २०८१' },
    title: { 
      en: 'Monthly Saving deposit deadline - Chaitra 30', 
      ne: 'मासिक बचत जम्मा गर्ने अन्तिम मिति - चैत ३०' 
    },
    desc: { 
      en: 'Please ensure all monthly deposits are cleared by month end.', 
      ne: 'कृपया सबै मासिक बचतहरू महिनाको अन्त्यसम्ममा जम्मा भएको सुनिश्चित गर्नुहोस्।' 
    },
    content: {
      en: 'All members are reminded to clear their monthly saving deposits for the month of Chaitra by the 30th. Timely deposits help in maintaining a good financial record and ensure you don\'t miss out on any benefits.',
      ne: 'सबै सदस्यहरूलाई चैत महिनाको आफ्नो मासिक बचत जम्मा चैत ३० गतेभित्र चुक्ता गर्न सम्झाइन्छ। समयमै जम्मा गर्नाले राम्रो वित्तीय रेकर्ड कायम राख्न मद्दत गर्दछ र तपाईंले कुनै पनि सुविधाहरू गुमाउनुहुने छैन।'
    },
    category: 'Financial'
  }
];
