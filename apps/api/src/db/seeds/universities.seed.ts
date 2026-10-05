import { FacultyData } from '@lms/shared-types';

export interface UniversitySeedData {
  name: string;
  nameAr: string;
  faculties: FacultyData[];
}

export const EGYPTIAN_UNIVERSITIES_SEED: UniversitySeedData[] = [
  {
    name: 'Cairo University',
    nameAr: 'جامعة القاهرة',
    faculties: [
      {
        name: 'Faculty of Engineering',
        nameAr: 'كلية الهندسة',
        departments: [
          { name: 'Computer Engineering', nameAr: 'هندسة الحاسبات' },
          { name: 'Electronics & Communications', nameAr: 'هندسة الإلكترونيات والاتصالات' },
          { name: 'Mechanical Engineering', nameAr: 'الهندسة الميكانيكية' },
          { name: 'Civil Engineering', nameAr: 'الهندسة المدنية' },
          { name: 'Architectural Engineering', nameAr: 'الهندسة المعمارية' },
        ],
        years: [
          { name: 'Preparatory Year', nameAr: 'إعدادي' },
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
      {
        name: 'Faculty of Computers and Artificial Intelligence',
        nameAr: 'كلية الحاسبات والذكاء الاصطناعي',
        departments: [
          { name: 'Computer Science', nameAr: 'علوم الحاسب' },
          { name: 'Information Systems', nameAr: 'نظم المعلومات' },
          { name: 'Information Technology', nameAr: 'تكنولوجيا المعلومات' },
          { name: 'Artificial Intelligence', nameAr: 'الذكاء الاصطناعي' },
        ],
        years: [
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
      {
        name: 'Faculty of Medicine',
        nameAr: 'كلية الطب البشري',
        departments: [
          { name: 'General Medicine & Surgery', nameAr: 'الطب والجراحة العامة' },
          { name: 'Pediatrics', nameAr: 'طب الأطفال' },
          { name: 'Internal Medicine', nameAr: 'الأمراض الباطنة' },
        ],
        years: [
          { name: 'First Year', nameAr: 'السنة الأولى' },
          { name: 'Second Year', nameAr: 'السنة الثانية' },
          { name: 'Third Year', nameAr: 'السنة الثالثة' },
          { name: 'Fourth Year', nameAr: 'السنة الرابعة' },
          { name: 'Fifth Year', nameAr: 'السنة الخامسة' },
        ],
      },
      {
        name: 'Faculty of Commerce',
        nameAr: 'كلية التجارة',
        departments: [
          { name: 'Accounting', nameAr: 'المحاسبة' },
          { name: 'Business Administration', nameAr: 'إدارة الأعمال' },
          { name: 'Economics', nameAr: 'الاقتصاد' },
        ],
        years: [
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
    ],
  },
  {
    name: 'Ain Shams University',
    nameAr: 'جامعة عين شمس',
    faculties: [
      {
        name: 'Faculty of Engineering',
        nameAr: 'كلية الهندسة',
        departments: [
          { name: 'Computer & Systems Engineering', nameAr: 'هندسة الحاسبات والنظم' },
          { name: 'Electrical Power Engineering', nameAr: 'هندسة القوى الكهربية' },
          { name: 'Design & Production Engineering', nameAr: 'هندسة التصميم والإنتاج' },
        ],
        years: [
          { name: 'Preparatory Year', nameAr: 'إعدادي' },
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
      {
        name: 'Faculty of Computer & Information Sciences',
        nameAr: 'كلية الحاسبات والمعلومات',
        departments: [
          { name: 'Computer Science', nameAr: 'علوم الحاسب' },
          { name: 'Information Systems', nameAr: 'نظم المعلومات' },
          { name: 'Scientific Computing', nameAr: 'الحسابات العلمية' },
        ],
        years: [
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
      {
        name: 'Faculty of Pharmacy',
        nameAr: 'كلية الصيدلة',
        departments: [
          { name: 'Pharm D', nameAr: 'فارم دي' },
          { name: 'Clinical Pharmacy', nameAr: 'الصيدلة الإكلينيكية' },
        ],
        years: [
          { name: 'First Year', nameAr: 'السنة الأولى' },
          { name: 'Second Year', nameAr: 'السنة الثانية' },
          { name: 'Third Year', nameAr: 'السنة الثالثة' },
          { name: 'Fourth Year', nameAr: 'السنة الرابعة' },
          { name: 'Fifth Year', nameAr: 'السنة الخامسة' },
        ],
      },
    ],
  },
  {
    name: 'Alexandria University',
    nameAr: 'جامعة الإسكندرية',
    faculties: [
      {
        name: 'Faculty of Engineering',
        nameAr: 'كلية الهندسة',
        departments: [
          { name: 'Computer & Communication Engineering', nameAr: 'هندسة الحاسبات والاتصالات' },
          { name: 'Mechanical Engineering', nameAr: 'الهندسة الميكانيكية' },
          { name: 'Marine Engineering', nameAr: 'الهندسة البحرية' },
        ],
        years: [
          { name: 'Preparatory Year', nameAr: 'إعدادي' },
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
      {
        name: 'Faculty of Science',
        nameAr: 'كلية العلوم',
        departments: [
          { name: 'Mathematics & Computer Science', nameAr: 'الرياضيات وعلوم الحاسب' },
          { name: 'Physics', nameAr: 'الفيزياء' },
          { name: 'Chemistry', nameAr: 'الكيمياء' },
        ],
        years: [
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
    ],
  },
  {
    name: 'Mansoura University',
    nameAr: 'جامعة المنصورة',
    faculties: [
      {
        name: 'Faculty of Engineering',
        nameAr: 'كلية الهندسة',
        departments: [
          { name: 'Computer & Control Systems', nameAr: 'هندسة الحاسبات والتحكم' },
          { name: 'Communications & Electronics', nameAr: 'هندسة الاتصالات والإلكترونيات' },
        ],
        years: [
          { name: 'Preparatory Year', nameAr: 'إعدادي' },
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
      {
        name: 'Faculty of Computers & Information',
        nameAr: 'كلية الحاسبات والمعلومات',
        departments: [
          { name: 'Computer Science', nameAr: 'علوم الحاسب' },
          { name: 'Information Systems', nameAr: 'نظم المعلومات' },
        ],
        years: [
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
    ],
  },
  {
    name: 'Helwan University',
    nameAr: 'جامعة حلوان',
    faculties: [
      {
        name: 'Faculty of Engineering (Helwan)',
        nameAr: 'كلية الهندسة بحلوان',
        departments: [
          { name: 'Computer Engineering', nameAr: 'هندسة الحاسبات' },
          { name: 'Biomedical Engineering', nameAr: 'الهندسة الطبية' },
        ],
        years: [
          { name: 'Preparatory Year', nameAr: 'إعدادي' },
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
      {
        name: 'Faculty of Applied Arts',
        nameAr: 'كلية الفنون التطبيقية',
        departments: [
          { name: 'Graphic Design', nameAr: 'التصميم الجرافيكي' },
          { name: 'Interior Design', nameAr: 'التصميم الداخلي' },
        ],
        years: [
          { name: 'Preparatory Year', nameAr: 'إعدادي' },
          { name: 'First Year', nameAr: 'الفرقة الأولى' },
          { name: 'Second Year', nameAr: 'الفرقة الثانية' },
          { name: 'Third Year', nameAr: 'الفرقة الثالثة' },
          { name: 'Fourth Year', nameAr: 'الفرقة الرابعة' },
        ],
      },
    ],
  },
];
