import { db } from "../db";
import { teamMembers } from "../db/schema";

async function seed() {
  console.log("Seeding team members...");

  const data = [
    {
      nameEn: "Bishnu Prasad Sapkota",
      nameNe: "विष्णु प्रसाद सापकोटा",
      roleEn: "Chairman",
      roleNe: "अध्यक्ष",
      department: "Board",
      bioEn: "Leading the cooperative with a vision of sustainable agricultural growth and financial empowerment for all members.",
      bioNe: "सबै सदस्यहरूको लागि दिगो कृषि विकास र वित्तीय सशक्तीकरणको दृष्टिकोणका साथ सहकारीको नेतृत्व गर्दै।",
      educationEn: "Master's in Rural Development",
      educationNe: "ग्रामीण विकासमा स्नातकोत्तर",
      experienceEn: ["15+ years in Cooperative Management", "Former Agricultural Advisor to Local Government"],
      experienceNe: ["सहकारी व्यवस्थापनमा १५+ वर्ष", "स्थानीय सरकारको पूर्व कृषि सल्लाहकार"],
      expertiseEn: ["Strategic Planning", "Community Leadership"],
      expertiseNe: ["रणनीतिक योजना", "सामुदायिक नेतृत्व"],
      imageKey: "team/chairman.jpg",
      sortOrder: 1,
    },
    {
      nameEn: "Sita Devi Sharma",
      nameNe: "सीता देवी शर्मा",
      roleEn: "General Manager",
      roleNe: "महाप्रबन्धक",
      department: "Management",
      bioEn: "Dedicated professional overseeing the daily operations and ensuring the highest standards of service delivery.",
      bioNe: "दैनिक सञ्चालनको निरीक्षण गर्ने र सेवा वितरणको उच्च मापदण्डहरू सुनिश्चित गर्ने समर्पित पेशेवर।",
      educationEn: "MBA in Finance",
      educationNe: "वित्तमा एमबीए",
      experienceEn: ["10 years in Banking and Cooperatives", "Expert in Financial Risk Management"],
      experienceNe: ["बैंकिङ र सहकारीमा १० वर्ष", "वित्तीय जोखिम व्यवस्थापनमा विशेषज्ञ"],
      expertiseEn: ["Operations Management", "Financial Analysis"],
      expertiseNe: ["सञ्चालन व्यवस्थापन", "वित्तीय विश्लेषण"],
      imageKey: "team/gm.jpg",
      sortOrder: 2,
    },
    {
      nameEn: "Ram Kumar Thapa",
      nameNe: "राम कुमार थापा",
      roleEn: "Agriculture Officer",
      roleNe: "कृषि अधिकृत",
      department: "Agriculture",
      bioEn: "Providing technical expertise to farmers and promoting modern sustainable farming practices.",
      bioNe: "किसानहरूलाई प्राविधिक विशेषज्ञता प्रदान गर्दै र आधुनिक दिगो खेती अभ्यासहरूलाई बढावा दिँदै।",
      educationEn: "B.Sc. in Agriculture",
      educationNe: "कृषिमा स्नातक",
      experienceEn: ["8 years of Field Experience", "Specialist in Organic Farming"],
      experienceNe: ["८ वर्षको क्षेत्र अनुभव", "अर्गानिक खेतीमा विशेषज्ञ"],
      expertiseEn: ["Soil Science", "Crop Rotation", "Pest Management"],
      expertiseNe: ["माटो विज्ञान", "बाली चक्र", "कीट व्यवस्थापन"],
      imageKey: "team/agri-officer.jpg",
      sortOrder: 3,
    },
    {
      nameEn: "Gita Kumari Poudel",
      nameNe: "गीता कुमारी पौडेल",
      roleEn: "Finance Manager",
      roleNe: "वित्त प्रबन्धक",
      department: "Finance",
      bioEn: "Managing the cooperative's financial health and ensuring transparent accounting practices.",
      bioNe: "सहकारीको वित्तीय स्वास्थ्य व्यवस्थापन गर्ने र पारदर्शी लेखा अभ्यासहरू सुनिश्चित गर्ने।",
      educationEn: "Chartered Accountant (CA)",
      educationNe: "चार्टर्ड एकाउन्टेन्ट (CA)",
      experienceEn: ["7 years of Audit Experience", "Financial Compliance Expert"],
      experienceNe: ["७ वर्षको लेखापरीक्षण अनुभव", "वित्तीय अनुपालन विशेषज्ञ"],
      expertiseEn: ["Taxation", "Auditing", "Budgeting"],
      expertiseNe: ["कराधान", "लेखापरीक्षण", "बजेटिङ"],
      imageKey: "team/finance-manager.jpg",
      sortOrder: 4,
    },
    {
      nameEn: "Hari Bahadur BK",
      nameNe: "हरि बहादुर विश्वकर्मा",
      roleEn: "Loan Officer",
      roleNe: "ऋण अधिकृत",
      department: "Operations",
      bioEn: "Helping members access financial resources for their personal and business growth.",
      bioNe: "सदस्यहरूलाई उनीहरूको व्यक्तिगत र व्यावसायिक वृद्धिको लागि वित्तीय स्रोतहरूमा पहुँच पुर्याउन मद्दत गर्दै।",
      educationEn: "BBS in Business Studies",
      educationNe: "व्यवसाय अध्ययनमा स्नातक",
      experienceEn: ["5 years in Credit Management", "Expert in Microfinance"],
      experienceNe: ["क्रेडिट व्यवस्थापनमा ५ वर्ष", "लघुवित्तमा विशेषज्ञ"],
      expertiseEn: ["Credit Appraisal", "Member Relations"],
      expertiseNe: ["ऋण मूल्यांकन", "सदस्य सम्बन्ध"],
      imageKey: "team/loan-officer.jpg",
      sortOrder: 5,
    },
    {
      nameEn: "Anjali Shrestha",
      nameNe: "अञ्जली श्रेष्ठ",
      roleEn: "IT Support Specialist",
      roleNe: "IT सहयोग विशेषज्ञ",
      department: "Technology",
      bioEn: "Maintaining our digital infrastructure and ensuring smooth technological integration.",
      bioNe: "हाम्रो डिजिटल पूर्वाधार कायम गर्ने र सहज प्राविधिक एकीकरण सुनिश्चित गर्ने।",
      educationEn: "B.Sc. CSIT",
      educationNe: "B.Sc. CSIT",
      experienceEn: ["4 years in System Administration", "Digital Transformation Enthusiast"],
      experienceNe: ["प्रणाली प्रशासनमा ४ वर्ष", "डिजिटल रूपान्तरण उत्साही"],
      expertiseEn: ["Network Security", "Software Maintenance"],
      expertiseNe: ["नेटवर्क सुरक्षा", "सफ्टवेयर मर्मतसम्भार"],
      imageKey: "team/it-specialist.jpg",
      sortOrder: 6,
    }
  ];

  try {
    for (const member of data) {
      await db.insert(teamMembers).values(member);
      console.log(`Inserted: ${member.nameEn}`);
    }
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding team:", error);
  }
}

seed();
