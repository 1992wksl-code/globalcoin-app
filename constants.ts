
import { CoinPackage, BankInfo } from './types';

export const INITIAL_PACKAGES: CoinPackage[] = [
  {
    id: 'pkg_1',
    name: 'Starter Pack',
    coinAmount: 100,
    priceKrw: 13000,
    description: '가벼운 주말 여행을 위한 완벽한 선택입니다.',
    isActive: true,
    visionOverview: 'Starter Pack은 새로운 여행자들을 위한 입문용 코인 패키지입니다.',
    visionGoals: '여행 결제의 디지털 전환을 경험하게 하는 것을 목표로 합니다.',
    visionUseCases: '공항 카페, 대중교통 이용, 소액 기념품 구매 등',
    visionRoadmap: '2024년 말까지 전 세계 50개 주요 공항 가맹점 확보 예정'
  },
  {
    id: 'pkg_2',
    name: 'Explorer Pack',
    coinAmount: 550,
    priceKrw: 65000,
    description: '자주 여행을 다니는 탐험가들을 위한 가장 인기 있는 패키지입니다.',
    isActive: true,
    isPopular: true,
    visionOverview: 'Explorer Pack은 전문 여행자들을 위한 중급 결제 솔루션입니다.',
    visionGoals: '글로벌 여행 네트워크 구축 및 수수료 제로화 실현',
    visionUseCases: '호텔 숙박, 로컬 투어 참여, 면세점 쇼핑 등',
    visionRoadmap: '2025년 상반기 아시아-유럽 통합 결제 망 구축'
  },
  {
    id: 'pkg_3',
    name: 'Nomad Bundle',
    coinAmount: 1200,
    priceKrw: 130000,
    description: '장기 여행자와 디지털 노마드를 위한 최고의 가치를 제공합니다.',
    isActive: true,
    visionOverview: 'Nomad Bundle은 국경 없는 삶을 지향하는 이들을 위한 통화입니다.',
    visionGoals: '전 세계 어디서나 현지 통화처럼 사용 가능한 완전한 자유',
    visionUseCases: '장기 숙박, 공유 오피스 결제, 국제 이동 수단 예약 등',
    visionRoadmap: '2025년 하반기 전용 신용카드 연동 및 스테이킹 서비스 런칭'
  }
];

export const DEFAULT_BANK_INFO: BankInfo = {
  bankName: '글로벌여행은행',
  accountNumber: '110-456-789012',
  accountHolder: '(주)글로벌코인네트워크',
};

export const DEPOSIT_DEADLINE_HOURS = 24;

export const AUTH_STORAGE_KEY = 'globalcoin_auth';
export const USERS_STORAGE_KEY = 'globalcoin_users_registry';
export const TRANSACTIONS_STORAGE_KEY = 'globalcoin_history';
export const PACKAGES_STORAGE_KEY = 'globalcoin_packages';
export const BANK_INFO_STORAGE_KEY = 'globalcoin_bank_info';
export const ADMIN_LOGS_STORAGE_KEY = 'globalcoin_admin_logs';
