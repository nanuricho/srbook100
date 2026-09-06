import { Book, Student, ReadingRecord } from '../types';
import { getCurrentBadge } from './badges';

export const STORAGE_KEY_STUDENTS = 'seoryong_students_v2';
export const STORAGE_KEY_CURRENT_STUDENT_ID = 'seoryong_current_student_id_v2';

export const SAMPLE_STUDENTS: Student[] = [
  {
    id: 's_3_1_1_김민준',
    grade: '3학년',
    className: '1반',
    studentNumber: '1번',
    name: '김민준',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-10', review: '강아지 똥이 민들레를 피우는 모습이 정말 감동적이었어요.', quote: '나도 누군가에게 꼭 필요한 존재가 될 수 있겠지?' },
      '2': { num: '2', status: 'COMPLETED', rating: 5, completedDate: '2026-03-15', review: '반짝이 비늘을 나누어 주며 친구를 얻는 지혜를 배웠어요.' },
      '4': { num: '4', status: 'COMPLETED', rating: 4, completedDate: '2026-03-20', review: '존의 상상력과 선생님의 오해가 재미있었어요.' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-28', review: '사탕을 먹고 마음의 소리를 듣는 장면이 따뜻했습니다.' },
      '17': { num: '17', status: 'COMPLETED', rating: 5, completedDate: '2026-04-05', review: '잎싹이의 헌신적인 사랑이 눈물겨웠습니다.' },
      '25': { num: '25', status: 'COMPLETED', rating: 4, completedDate: '2026-04-12', review: '소금과 후추를 뿌려 책을 먹는 여우가 귀여웠어요.' },
      '33': { num: '33', status: 'COMPLETED', rating: 5, completedDate: '2026-04-20', review: '내 마음의 감정들을 단어로 표현하는 법을 알게 되었어요.' },
      '34': { num: '34', status: 'COMPLETED', rating: 5, completedDate: '2026-05-01', review: '와니니가 어려움을 딛고 성장하는 모험이 흥미진진했습니다.' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-05-15', review: '달콤한 떡을 먹고 착한 말을 하게 되는 만복이가 멋졌어요.' },
      '42': { num: '42', status: 'COMPLETED', rating: 5, completedDate: '2026-05-25', review: '샬롯과 윌버의 진정한 우정이 마음에 남아요.' },
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-06-02', review: '가장 중요한 것은 눈에 보이지 않는다는 말이 깊게 와닿았습니다.', quote: '네가 길들인 것에 넌 영원히 책임이 있어.' },
      '50': { num: '50', status: 'IN_PROGRESS' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 's_3_1_2_이서아',
    grade: '3학년',
    className: '1반',
    studentNumber: '2번',
    name: '이서아',
    records: {
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-12', review: '동동이가 아빠의 사랑을 깨닫는 장면이 뭉클했어요.' },
      '11': { num: '11', status: 'COMPLETED', rating: 5, completedDate: '2026-03-19', review: '선녀님이 요구르트를 마시는 모습이 너무 유쾌했습니다.' },
      '13': { num: '13', status: 'COMPLETED', rating: 4, completedDate: '2026-04-02', review: '구름빵을 먹고 하늘을 날아 아빠에게 빵을 전해주는 이야기.' },
      '33': { num: '33', status: 'COMPLETED', rating: 5, completedDate: '2026-04-18', review: '친구들의 마음을 더 잘 이해할 수 있게 되었습니다.' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-05-08', review: '만복이의 입에서 예쁜 말만 나오게 되어 기뻤어요.' },
      '37': { num: '37', status: 'COMPLETED', rating: 4, completedDate: '2026-05-20', review: '장군이네 떡집도 만복이네만큼 재미있었어요.' },
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-06-05', review: '어린 왕자가 만난 장미와 여우 이야기가 생각나요.' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-05T12:00:00.000Z',
  },
  {
    id: 's_3_1_3_박도윤',
    grade: '3학년',
    className: '1반',
    studentNumber: '3번',
    name: '박도윤',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-08' },
      '8': { num: '8', status: 'COMPLETED', rating: 4, completedDate: '2026-03-22' },
      '18': { num: '18', status: 'COMPLETED', rating: 5, completedDate: '2026-04-10' },
      '20': { num: '20', status: 'COMPLETED', rating: 5, completedDate: '2026-05-02' },
      '35': { num: '35', status: 'IN_PROGRESS' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-02T09:00:00.000Z',
  },
  {
    id: 's_3_1_4_최지우',
    grade: '3학년',
    className: '1반',
    studentNumber: '4번',
    name: '최지우',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-05' },
      '2': { num: '2', status: 'COMPLETED', rating: 4, completedDate: '2026-03-15' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-25' },
      '6': { num: '6', status: 'COMPLETED', rating: 5, completedDate: '2026-04-01' },
      '11': { num: '11', status: 'COMPLETED', rating: 5, completedDate: '2026-04-15' },
      '17': { num: '17', status: 'COMPLETED', rating: 5, completedDate: '2026-04-28' },
      '25': { num: '25', status: 'COMPLETED', rating: 4, completedDate: '2026-05-10' },
      '33': { num: '33', status: 'COMPLETED', rating: 5, completedDate: '2026-05-18' },
      '34': { num: '34', status: 'COMPLETED', rating: 5, completedDate: '2026-05-28' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-06-01' },
      '36': { num: '36', status: 'COMPLETED', rating: 5, completedDate: '2026-06-05' },
      '38': { num: '38', status: 'COMPLETED', rating: 5, completedDate: '2026-06-10' },
      '42': { num: '42', status: 'COMPLETED', rating: 5, completedDate: '2026-06-12' },
      '43': { num: '43', status: 'COMPLETED', rating: 4, completedDate: '2026-06-15' },
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-06-18' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-18T14:00:00.000Z',
  },
  {
    id: 's_3_1_5_정예준',
    grade: '3학년',
    className: '1반',
    studentNumber: '5번',
    name: '정예준',
    records: {
      '3': { num: '3', status: 'COMPLETED', rating: 4, completedDate: '2026-03-11' },
      '25': { num: '25', status: 'COMPLETED', rating: 5, completedDate: '2026-04-05' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-05-02' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-02T11:00:00.000Z',
  },
  {
    id: 's_3_2_1_강하은',
    grade: '3학년',
    className: '2반',
    studentNumber: '1번',
    name: '강하은',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-04' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-14' },
      '11': { num: '11', status: 'COMPLETED', rating: 4, completedDate: '2026-03-24' },
      '17': { num: '17', status: 'COMPLETED', rating: 5, completedDate: '2026-04-11' },
      '33': { num: '33', status: 'COMPLETED', rating: 5, completedDate: '2026-04-25' },
      '34': { num: '34', status: 'COMPLETED', rating: 5, completedDate: '2026-05-12' },
      '35': { num: '35', status: 'COMPLETED', rating: 5, completedDate: '2026-05-22' },
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-06-03' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-03T15:00:00.000Z',
  },
  {
    id: 's_3_2_2_윤시우',
    grade: '3학년',
    className: '2반',
    studentNumber: '2번',
    name: '윤시우',
    records: {
      '4': { num: '4', status: 'COMPLETED', rating: 4, completedDate: '2026-03-10' },
      '18': { num: '18', status: 'COMPLETED', rating: 4, completedDate: '2026-03-20' },
      '25': { num: '25', status: 'COMPLETED', rating: 5, completedDate: '2026-04-15' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-04-15T10:00:00.000Z',
  },
  // 1학년 Sample Students
  {
    id: 's_1_1_1_김하람',
    grade: '1학년',
    className: '1반',
    studentNumber: '1번',
    name: '김하람',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-10' },
      '2': { num: '2', status: 'COMPLETED', rating: 5, completedDate: '2026-03-16' },
      '4': { num: '4', status: 'COMPLETED', rating: 4, completedDate: '2026-03-22' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-04-05' },
      '8': { num: '8', status: 'COMPLETED', rating: 5, completedDate: '2026-04-18' },
      '11': { num: '11', status: 'COMPLETED', rating: 4, completedDate: '2026-05-02' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-02T10:00:00.000Z',
  },
  {
    id: 's_1_1_2_이서준',
    grade: '1학년',
    className: '1반',
    studentNumber: '2번',
    name: '이서준',
    records: {
      '1': { num: '1', status: 'COMPLETED', rating: 5, completedDate: '2026-03-08' },
      '3': { num: '3', status: 'COMPLETED', rating: 4, completedDate: '2026-03-15' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-25' },
      '6': { num: '6', status: 'COMPLETED', rating: 5, completedDate: '2026-04-03' },
      '8': { num: '8', status: 'COMPLETED', rating: 4, completedDate: '2026-04-14' },
      '10': { num: '10', status: 'COMPLETED', rating: 5, completedDate: '2026-04-26' },
      '13': { num: '13', status: 'COMPLETED', rating: 5, completedDate: '2026-05-08' },
      '14': { num: '14', status: 'COMPLETED', rating: 4, completedDate: '2026-05-18' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-18T11:00:00.000Z',
  },
  {
    id: 's_1_2_1_박예은',
    grade: '1학년',
    className: '2반',
    studentNumber: '1번',
    name: '박예은',
    records: {
      '2': { num: '2', status: 'COMPLETED', rating: 5, completedDate: '2026-03-12' },
      '5': { num: '5', status: 'COMPLETED', rating: 5, completedDate: '2026-03-24' },
      '9': { num: '9', status: 'COMPLETED', rating: 4, completedDate: '2026-04-08' },
      '11': { num: '11', status: 'COMPLETED', rating: 5, completedDate: '2026-04-20' },
      '15': { num: '15', status: 'COMPLETED', rating: 5, completedDate: '2026-05-10' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-10T14:00:00.000Z',
  },
  // 2학년 Sample Students
  {
    id: 's_2_1_1_최유진',
    grade: '2학년',
    className: '1반',
    studentNumber: '1번',
    name: '최유진',
    records: {
      '17': { num: '17', status: 'COMPLETED', rating: 5, completedDate: '2026-03-09' },
      '18': { num: '18', status: 'COMPLETED', rating: 4, completedDate: '2026-03-18' },
      '20': { num: '20', status: 'COMPLETED', rating: 5, completedDate: '2026-03-29' },
      '25': { num: '25', status: 'COMPLETED', rating: 5, completedDate: '2026-04-12' },
      '27': { num: '27', status: 'COMPLETED', rating: 4, completedDate: '2026-04-24' },
      '31': { num: '31', status: 'COMPLETED', rating: 5, completedDate: '2026-05-06' },
      '32': { num: '32', status: 'COMPLETED', rating: 5, completedDate: '2026-05-20' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-20T16:00:00.000Z',
  },
  {
    id: 's_2_1_2_정민호',
    grade: '2학년',
    className: '1반',
    studentNumber: '2번',
    name: '정민호',
    records: {
      '17': { num: '17', status: 'COMPLETED', rating: 5, completedDate: '2026-03-05' },
      '19': { num: '19', status: 'COMPLETED', rating: 4, completedDate: '2026-03-14' },
      '21': { num: '21', status: 'COMPLETED', rating: 4, completedDate: '2026-03-25' },
      '24': { num: '24', status: 'COMPLETED', rating: 5, completedDate: '2026-04-04' },
      '25': { num: '25', status: 'COMPLETED', rating: 5, completedDate: '2026-04-15' },
      '26': { num: '26', status: 'COMPLETED', rating: 4, completedDate: '2026-04-28' },
      '28': { num: '28', status: 'COMPLETED', rating: 5, completedDate: '2026-05-09' },
      '30': { num: '30', status: 'COMPLETED', rating: 4, completedDate: '2026-05-21' },
      '31': { num: '31', status: 'COMPLETED', rating: 5, completedDate: '2026-06-01' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-01T15:00:00.000Z',
  },
  {
    id: 's_2_2_1_한소율',
    grade: '2학년',
    className: '2반',
    studentNumber: '1번',
    name: '한소율',
    records: {
      '18': { num: '18', status: 'COMPLETED', rating: 5, completedDate: '2026-03-11' },
      '20': { num: '20', status: 'COMPLETED', rating: 5, completedDate: '2026-03-22' },
      '22': { num: '22', status: 'COMPLETED', rating: 4, completedDate: '2026-04-08' },
      '25': { num: '25', status: 'COMPLETED', rating: 5, completedDate: '2026-04-19' },
      '29': { num: '29', status: 'COMPLETED', rating: 4, completedDate: '2026-05-03' },
      '31': { num: '31', status: 'COMPLETED', rating: 5, completedDate: '2026-05-17' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-17T13:00:00.000Z',
  },
  // 4학년 Sample Students
  {
    id: 's_4_1_1_신서연',
    grade: '4학년',
    className: '1반',
    studentNumber: '1번',
    name: '신서연',
    records: {
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-03-07' },
      '50': { num: '50', status: 'COMPLETED', rating: 5, completedDate: '2026-03-17' },
      '52': { num: '52', status: 'COMPLETED', rating: 4, completedDate: '2026-03-28' },
      '54': { num: '54', status: 'COMPLETED', rating: 5, completedDate: '2026-04-09' },
      '56': { num: '56', status: 'COMPLETED', rating: 4, completedDate: '2026-04-21' },
      '58': { num: '58', status: 'COMPLETED', rating: 5, completedDate: '2026-05-04' },
      '60': { num: '60', status: 'COMPLETED', rating: 5, completedDate: '2026-05-16' },
      '62': { num: '62', status: 'COMPLETED', rating: 4, completedDate: '2026-05-28' },
      '64': { num: '64', status: 'COMPLETED', rating: 5, completedDate: '2026-06-08' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-08T12:00:00.000Z',
  },
  {
    id: 's_4_1_2_오준우',
    grade: '4학년',
    className: '1반',
    studentNumber: '2번',
    name: '오준우',
    records: {
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-03-04' },
      '51': { num: '51', status: 'COMPLETED', rating: 5, completedDate: '2026-03-13' },
      '53': { num: '53', status: 'COMPLETED', rating: 4, completedDate: '2026-03-24' },
      '54': { num: '54', status: 'COMPLETED', rating: 5, completedDate: '2026-04-03' },
      '55': { num: '55', status: 'COMPLETED', rating: 4, completedDate: '2026-04-14' },
      '57': { num: '57', status: 'COMPLETED', rating: 5, completedDate: '2026-04-26' },
      '58': { num: '58', status: 'COMPLETED', rating: 5, completedDate: '2026-05-07' },
      '60': { num: '60', status: 'COMPLETED', rating: 4, completedDate: '2026-05-18' },
      '61': { num: '61', status: 'COMPLETED', rating: 5, completedDate: '2026-05-29' },
      '63': { num: '63', status: 'COMPLETED', rating: 4, completedDate: '2026-06-05' },
      '64': { num: '64', status: 'COMPLETED', rating: 5, completedDate: '2026-06-12' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-12T14:00:00.000Z',
  },
  {
    id: 's_4_2_1_문지아',
    grade: '4학년',
    className: '2반',
    studentNumber: '1번',
    name: '문지아',
    records: {
      '49': { num: '49', status: 'COMPLETED', rating: 5, completedDate: '2026-03-08' },
      '50': { num: '50', status: 'COMPLETED', rating: 5, completedDate: '2026-03-20' },
      '52': { num: '52', status: 'COMPLETED', rating: 4, completedDate: '2026-04-02' },
      '55': { num: '55', status: 'COMPLETED', rating: 5, completedDate: '2026-04-16' },
      '56': { num: '56', status: 'COMPLETED', rating: 4, completedDate: '2026-04-29' },
      '58': { num: '58', status: 'COMPLETED', rating: 5, completedDate: '2026-05-12' },
      '60': { num: '60', status: 'COMPLETED', rating: 5, completedDate: '2026-05-24' },
      '63': { num: '63', status: 'COMPLETED', rating: 4, completedDate: '2026-06-06' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-06T15:00:00.000Z',
  },
  // 5학년 Sample Students
  {
    id: 's_5_1_1_배승우',
    grade: '5학년',
    className: '1반',
    studentNumber: '1번',
    name: '배승우',
    records: {
      '65': { num: '65', status: 'COMPLETED', rating: 5, completedDate: '2026-03-06' },
      '66': { num: '66', status: 'COMPLETED', rating: 5, completedDate: '2026-03-16' },
      '68': { num: '68', status: 'COMPLETED', rating: 4, completedDate: '2026-03-27' },
      '69': { num: '69', status: 'COMPLETED', rating: 5, completedDate: '2026-04-08' },
      '70': { num: '70', status: 'COMPLETED', rating: 5, completedDate: '2026-04-20' },
      '72': { num: '72', status: 'COMPLETED', rating: 4, completedDate: '2026-05-02' },
      '74': { num: '74', status: 'COMPLETED', rating: 5, completedDate: '2026-05-14' },
      '76': { num: '76', status: 'COMPLETED', rating: 4, completedDate: '2026-05-26' },
      '78': { num: '78', status: 'COMPLETED', rating: 5, completedDate: '2026-06-04' },
      '80': { num: '80', status: 'COMPLETED', rating: 5, completedDate: '2026-06-14' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-14T11:00:00.000Z',
  },
  {
    id: 's_5_1_2_류하린',
    grade: '5학년',
    className: '1반',
    studentNumber: '2번',
    name: '류하린',
    records: {
      '65': { num: '65', status: 'COMPLETED', rating: 5, completedDate: '2026-03-03' },
      '67': { num: '67', status: 'COMPLETED', rating: 4, completedDate: '2026-03-12' },
      '68': { num: '68', status: 'COMPLETED', rating: 5, completedDate: '2026-03-22' },
      '70': { num: '70', status: 'COMPLETED', rating: 5, completedDate: '2026-04-01' },
      '71': { num: '71', status: 'COMPLETED', rating: 4, completedDate: '2026-04-12' },
      '73': { num: '73', status: 'COMPLETED', rating: 5, completedDate: '2026-04-23' },
      '75': { num: '75', status: 'COMPLETED', rating: 4, completedDate: '2026-05-05' },
      '77': { num: '77', status: 'COMPLETED', rating: 5, completedDate: '2026-05-17' },
      '78': { num: '78', status: 'COMPLETED', rating: 5, completedDate: '2026-05-28' },
      '79': { num: '79', status: 'COMPLETED', rating: 4, completedDate: '2026-06-03' },
      '80': { num: '80', status: 'COMPLETED', rating: 5, completedDate: '2026-06-11' },
      '97': { num: '97', status: 'COMPLETED', rating: 5, completedDate: '2026-06-18' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-18T16:00:00.000Z',
  },
  {
    id: 's_5_2_1_송우진',
    grade: '5학년',
    className: '2반',
    studentNumber: '1번',
    name: '송우진',
    records: {
      '66': { num: '66', status: 'COMPLETED', rating: 5, completedDate: '2026-03-09' },
      '68': { num: '68', status: 'COMPLETED', rating: 4, completedDate: '2026-03-21' },
      '69': { num: '69', status: 'COMPLETED', rating: 5, completedDate: '2026-04-04' },
      '72': { num: '72', status: 'COMPLETED', rating: 5, completedDate: '2026-04-18' },
      '74': { num: '74', status: 'COMPLETED', rating: 4, completedDate: '2026-05-01' },
      '76': { num: '76', status: 'COMPLETED', rating: 5, completedDate: '2026-05-15' },
      '78': { num: '78', status: 'COMPLETED', rating: 4, completedDate: '2026-05-30' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-05-30T10:00:00.000Z',
  },
  // 6학년 Sample Students
  {
    id: 's_6_1_1_홍시은',
    grade: '6학년',
    className: '1반',
    studentNumber: '1번',
    name: '홍시은',
    records: {
      '81': { num: '81', status: 'COMPLETED', rating: 5, completedDate: '2026-03-05' },
      '82': { num: '82', status: 'COMPLETED', rating: 5, completedDate: '2026-03-14' },
      '83': { num: '83', status: 'COMPLETED', rating: 4, completedDate: '2026-03-23' },
      '84': { num: '84', status: 'COMPLETED', rating: 5, completedDate: '2026-04-02' },
      '86': { num: '86', status: 'COMPLETED', rating: 4, completedDate: '2026-04-13' },
      '88': { num: '88', status: 'COMPLETED', rating: 5, completedDate: '2026-04-25' },
      '89': { num: '89', status: 'COMPLETED', rating: 5, completedDate: '2026-05-06' },
      '91': { num: '91', status: 'COMPLETED', rating: 4, completedDate: '2026-05-17' },
      '92': { num: '92', status: 'COMPLETED', rating: 5, completedDate: '2026-05-27' },
      '94': { num: '94', status: 'COMPLETED', rating: 5, completedDate: '2026-06-04' },
      '95': { num: '95', status: 'COMPLETED', rating: 4, completedDate: '2026-06-10' },
      '96': { num: '96', status: 'COMPLETED', rating: 5, completedDate: '2026-06-15' },
      '98': { num: '98', status: 'COMPLETED', rating: 5, completedDate: '2026-06-19' },
      '100': { num: '100', status: 'COMPLETED', rating: 5, completedDate: '2026-06-22' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-22T15:00:00.000Z',
  },
  {
    id: 's_6_1_2_조태현',
    grade: '6학년',
    className: '1반',
    studentNumber: '2번',
    name: '조태현',
    records: {
      '81': { num: '81', status: 'COMPLETED', rating: 5, completedDate: '2026-03-07' },
      '83': { num: '83', status: 'COMPLETED', rating: 4, completedDate: '2026-03-17' },
      '85': { num: '85', status: 'COMPLETED', rating: 5, completedDate: '2026-03-28' },
      '87': { num: '87', status: 'COMPLETED', rating: 4, completedDate: '2026-04-09' },
      '89': { num: '89', status: 'COMPLETED', rating: 5, completedDate: '2026-04-20' },
      '90': { num: '90', status: 'COMPLETED', rating: 4, completedDate: '2026-05-03' },
      '92': { num: '92', status: 'COMPLETED', rating: 5, completedDate: '2026-05-14' },
      '93': { num: '93', status: 'COMPLETED', rating: 5, completedDate: '2026-05-25' },
      '95': { num: '95', status: 'COMPLETED', rating: 4, completedDate: '2026-06-05' },
      '96': { num: '96', status: 'COMPLETED', rating: 5, completedDate: '2026-06-12' },
      '99': { num: '99', status: 'COMPLETED', rating: 5, completedDate: '2026-06-18' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-18T12:00:00.000Z',
  },
  {
    id: 's_6_2_1_임서진',
    grade: '6학년',
    className: '2반',
    studentNumber: '1번',
    name: '임서진',
    records: {
      '82': { num: '82', status: 'COMPLETED', rating: 5, completedDate: '2026-03-06' },
      '84': { num: '84', status: 'COMPLETED', rating: 5, completedDate: '2026-03-15' },
      '85': { num: '85', status: 'COMPLETED', rating: 4, completedDate: '2026-03-26' },
      '86': { num: '86', status: 'COMPLETED', rating: 5, completedDate: '2026-04-06' },
      '88': { num: '88', status: 'COMPLETED', rating: 4, completedDate: '2026-04-17' },
      '89': { num: '89', status: 'COMPLETED', rating: 5, completedDate: '2026-04-28' },
      '91': { num: '91', status: 'COMPLETED', rating: 4, completedDate: '2026-05-09' },
      '93': { num: '93', status: 'COMPLETED', rating: 5, completedDate: '2026-05-20' },
      '94': { num: '94', status: 'COMPLETED', rating: 5, completedDate: '2026-05-31' },
      '95': { num: '95', status: 'COMPLETED', rating: 4, completedDate: '2026-06-08' },
      '96': { num: '96', status: 'COMPLETED', rating: 5, completedDate: '2026-06-14' },
      '97': { num: '97', status: 'COMPLETED', rating: 5, completedDate: '2026-06-19' },
      '100': { num: '100', status: 'COMPLETED', rating: 5, completedDate: '2026-06-24' },
    },
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-06-24T17:00:00.000Z',
  }
];

export function loadStudentsFromStorage(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      return SAMPLE_STUDENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // If only some grades exist, supplement with sample students for missing grades so grade averages always display authentically
      const presentGrades = new Set(parsed.map((s) => s.grade));
      const missingSamples = SAMPLE_STUDENTS.filter((s) => !presentGrades.has(s.grade));
      return [...parsed, ...missingSamples];
    }
    return SAMPLE_STUDENTS;
  } catch (e) {
    console.error('Error reading students from storage', e);
    return SAMPLE_STUDENTS;
  }
}

export function saveStudentsToStorage(students: Student[]) {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Error saving students to storage', e);
  }
}

export function getCompletedCount(student: Student): number {
  return Object.values(student.records || {}).filter((r) => r.status === 'COMPLETED').length;
}

export function getInProgressCount(student: Student): number {
  return Object.values(student.records || {}).filter((r) => r.status === 'IN_PROGRESS').length;
}

export function getStudentProgressPercent(student: Student, totalBooks = 100): number {
  const completed = getCompletedCount(student);
  if (totalBooks <= 0) return 0;
  return Math.min(100, Math.round((completed / totalBooks) * 100));
}

export interface ParsedStudentRow {
  grade: string;
  className: string;
  studentNumber: string;
  name: string;
}

/**
 * Batch parser supporting:
 * 1. CSV / TSV format (학년, 반, 번호, 이름 or 3, 1, 1, 김민준)
 * 2. Space-separated text: "3학년 1반 1번 김민준" or "3-1 1 김민준"
 * 3. Comma/newline-separated name list with fallback grade/class
 */
export function parseBatchStudentInput(
  rawText: string,
  defaultGrade = '3학년',
  defaultClass = '1반'
): ParsedStudentRow[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const results: ParsedStudentRow[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip table header if present
    if (
      i === 0 &&
      (line.includes('학년') && line.includes('이름')) ||
      line.startsWith('grade,') ||
      line.startsWith('번호,이름')
    ) {
      continue;
    }

    // Check if line contains CSV/TSV separators
    if (line.includes(',') || line.includes('\t')) {
      const parts = line.split(/[,\t]/).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 4) {
        // [학년, 반, 번호, 이름]
        results.push({
          grade: normalizeGrade(parts[0], defaultGrade),
          className: normalizeClass(parts[1], defaultClass),
          studentNumber: normalizeNumber(parts[2], String(results.length + 1)),
          name: parts[3] || '이름 없음',
        });
        continue;
      } else if (parts.length === 3) {
        // [반, 번호, 이름] or [번호, 이름, ...]
        if (parts[0].includes('반') || parts[0].includes('학년') || /^\d+$/.test(parts[0])) {
          results.push({
            grade: defaultGrade,
            className: normalizeClass(parts[0], defaultClass),
            studentNumber: normalizeNumber(parts[1], String(results.length + 1)),
            name: parts[2],
          });
        } else {
          results.push({
            grade: defaultGrade,
            className: defaultClass,
            studentNumber: normalizeNumber(parts[0], String(results.length + 1)),
            name: parts[1],
          });
        }
        continue;
      } else if (parts.length === 2) {
        // [번호, 이름] or [반, 이름]
        if (/^\d+$/.test(parts[0])) {
          results.push({
            grade: defaultGrade,
            className: defaultClass,
            studentNumber: normalizeNumber(parts[0], String(results.length + 1)),
            name: parts[1],
          });
        } else {
          results.push({
            grade: defaultGrade,
            className: defaultClass,
            studentNumber: `${results.length + 1}번`,
            name: parts[1],
          });
        }
        continue;
      }
    }

    // Pattern matching for space separated formats:
    // e.g. "3-1 15 김민준", "3학년 1반 15번 김민준", "1반 김민준", "김민준"
    const dashMatch = line.match(/^(\d+)[-~](\d+)\s+(\d+)\s+(.+)$/);
    if (dashMatch) {
      results.push({
        grade: `${dashMatch[1]}학년`,
        className: `${dashMatch[2]}반`,
        studentNumber: `${dashMatch[3]}번`,
        name: dashMatch[4].trim(),
      });
      continue;
    }

    const fullMatch = line.match(/^(\d+)학년\s+(\d+)반\s+(\d+)번?\s+(.+)$/);
    if (fullMatch) {
      results.push({
        grade: `${fullMatch[1]}학년`,
        className: `${fullMatch[2]}반`,
        studentNumber: `${fullMatch[3]}번`,
        name: fullMatch[4].trim(),
      });
      continue;
    }

    const classNumMatch = line.match(/^(\d+)반\s+(\d+)번?\s+(.+)$/);
    if (classNumMatch) {
      results.push({
        grade: defaultGrade,
        className: `${classNumMatch[1]}반`,
        studentNumber: `${classNumMatch[2]}번`,
        name: classNumMatch[3].trim(),
      });
      continue;
    }

    const numNameMatch = line.match(/^(\d+)번?[\s.:]\s*(.+)$/);
    if (numNameMatch) {
      results.push({
        grade: defaultGrade,
        className: defaultClass,
        studentNumber: `${numNameMatch[1]}번`,
        name: numNameMatch[2].trim(),
      });
      continue;
    }

    // Just names separated by commas or spaces in a single line
    const nameTokens = line.split(/[,\s]+/).map((t) => t.trim()).filter((t) => t.length > 0 && !/^\d+$/.test(t));
    if (nameTokens.length > 1 && !line.includes('학년')) {
      for (const token of nameTokens) {
        results.push({
          grade: defaultGrade,
          className: defaultClass,
          studentNumber: `${results.length + 1}번`,
          name: token,
        });
      }
      continue;
    }

    // Default single name line
    if (line.trim()) {
      results.push({
        grade: defaultGrade,
        className: defaultClass,
        studentNumber: `${results.length + 1}번`,
        name: line.trim(),
      });
    }
  }

  return results;
}

function normalizeGrade(val: string, fallback: string): string {
  if (!val) return fallback;
  const clean = val.replace(/[^0-9]/g, '');
  if (clean) return `${clean}학년`;
  if (val.includes('학년')) return val.trim();
  return fallback;
}

function normalizeClass(val: string, fallback: string): string {
  if (!val) return fallback;
  const clean = val.replace(/[^0-9]/g, '');
  if (clean) return `${clean}반`;
  if (val.includes('반')) return val.trim();
  return fallback;
}

function normalizeNumber(val: string, fallbackNum: string): string {
  if (!val) return `${fallbackNum}번`;
  const clean = val.replace(/[^0-9]/g, '');
  if (clean) return `${clean}번`;
  return `${fallbackNum}번`;
}

/**
 * Generate sample CSV template for teachers to fill in
 */
export function generateStudentTemplateCSV(): string {
  const headers = ['학년', '반', '번호', '이름'];
  const sampleRows = [
    ['3학년', '1반', '1번', '김민준'],
    ['3학년', '1반', '2번', '이서아'],
    ['3학년', '1반', '3번', '박도윤'],
    ['3학년', '1반', '4번', '최지우'],
    ['3학년', '1반', '5번', '정예준'],
    ['3학년', '2반', '1번', '강하은'],
    ['3학년', '2반', '2번', '조윤우'],
  ];

  return [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Generate unique student ID
 */
export function createStudentId(grade: string, className: string, studentNumber: string, name: string): string {
  const g = grade.replace(/[^0-9]/g, '') || '0';
  const c = className.replace(/[^0-9]/g, '') || '0';
  const n = studentNumber.replace(/[^0-9]/g, '') || '0';
  const cleanName = name.replace(/\s+/g, '');
  return `s_${g}_${c}_${n}_${cleanName}_${Date.now().toString(36).slice(-4)}`;
}

/**
 * Export students roster to CSV text
 */
export function exportStudentsRosterCSV(students: Student[], totalBooks = 100): string {
  const headers = ['학년', '반', '번호', '이름', '완독권수', '읽는중', '달성률(%)', '칭호', '최근활동일'];
  const rows = students.map((s) => {
    const completed = getCompletedCount(s);
    const inProgress = getInProgressCount(s);
    const percent = totalBooks > 0 ? Math.round((completed / totalBooks) * 100) : 0;
    const badge = getCurrentBadge(completed)?.title || '독서 시작';
    const lastDate = s.updatedAt ? s.updatedAt.split('T')[0] : '';
    return [
      `"${s.grade}"`,
      `"${s.className}"`,
      `"${s.studentNumber || ''}"`,
      `"${s.name}"`,
      completed,
      inProgress,
      `"${percent}%"`,
      `"${badge}"`,
      `"${lastDate}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Export all detailed student book reviews and ratings to CSV
 */
export function exportReviewsDetailedCSV(students: Student[], books: Book[]): string {
  const bookMap = new Map<string, Book>();
  books.forEach((b) => bookMap.set(b.num, b));

  const headers = [
    '학년',
    '반',
    '번호',
    '학생이름',
    '도서번호',
    '도서명',
    '저자',
    '권장학년',
    '독서상태',
    '별점',
    '간단감상평(느낀점)',
    '인상깊은한줄(구절)',
    '완독일자',
    '기록일시',
  ];

  const rows: string[] = [];

  students.forEach((s) => {
    const studentRecords = s.records || {};
    Object.values(studentRecords).forEach((rec) => {
      const book = bookMap.get(rec.num);
      const statusLabel =
        rec.status === 'COMPLETED' ? '완독 완료' : rec.status === 'IN_PROGRESS' ? '읽는 중' : '읽기 전';
      const ratingText = rec.rating ? `${rec.rating}점` : '';
      const reviewText = (rec.review || '').replace(/"/g, '""');
      const quoteText = (rec.quote || '').replace(/"/g, '""');

      rows.push(
        [
          `"${s.grade}"`,
          `"${s.className}"`,
          `"${s.studentNumber || ''}"`,
          `"${s.name}"`,
          `"${rec.num}"`,
          `"${(book?.title || `도서 #${rec.num}`).replace(/"/g, '""')}"`,
          `"${(book?.author || '').replace(/"/g, '""')}"`,
          `"${book?.grade || ''}"`,
          `"${statusLabel}"`,
          `"${ratingText}"`,
          `"${reviewText}"`,
          `"${quoteText}"`,
          `"${rec.completedDate || ''}"`,
          `"${rec.updatedAt ? rec.updatedAt.split('T')[0] : ''}"`,
        ].join(',')
      );
    });
  });

  return [headers.join(','), ...rows].join('\r\n');
}
