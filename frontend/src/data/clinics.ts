// ── 공유 Clinic 타입 & 목 데이터 ────────────────────────────
// ClinicSettingsPage, BillingPage 등 모든 페이지가 이 파일을 참조한다.
// 실서버 연동 시 이 파일의 목 데이터를 API 호출로 교체하면 된다.

export type ServiceType = 'RPM' | 'CCM' | 'BHI' | 'PCM'

export interface Clinic {
  id:       number
  name:     string
  code:     string   // 3자리 고유 코드
  state:    string
  services: ServiceType[]
  active:   boolean
  dbId?:    string   // DB UUID — API 연동 후 채워짐
}

export const CLINICS: Clinic[] = [
  { id:1,  name:'Sunrise Health Center',    code:'SDW', state:'CA', services:['RPM','CCM'], active:true  },
  { id:2,  name:'Westside Clinic',          code:'WSC', state:'CA', services:['RPM'],        active:true  },
  { id:3,  name:'Lakeview Medical',         code:'LVM', state:'TX', services:['CCM'],        active:true  },
  { id:4,  name:'Pacific Care Group',       code:'PCG', state:'CA', services:['RPM','CCM'], active:true  },
  { id:5,  name:'Northside Family Health',  code:'NFH', state:'NY', services:['RPM'],        active:true  },
  { id:6,  name:'Summit Wellness Center',   code:'SWC', state:'WA', services:['RPM','CCM'], active:true  },
  { id:7,  name:'Greenfield Medical',       code:'GFM', state:'FL', services:['CCM'],        active:false },
  { id:8,  name:'Riverside Health',         code:'RVH', state:'TX', services:['RPM','CCM'], active:true  },
  { id:9,  name:'Harbor View Clinic',       code:'HVC', state:'CA', services:['RPM'],        active:true  },
  { id:10, name:'Midtown Medical Group',    code:'MMG', state:'NY', services:['RPM','CCM'], active:true  },
  { id:11, name:'Valley Primary Care',      code:'VPC', state:'AZ', services:['CCM'],        active:false },
  { id:12, name:'Eastside Health Partners', code:'EHP', state:'IL', services:['RPM'],        active:true  },
]

/** 클리닉별 서비스 타입별 활성 환자 수 */
export const ACTIVE_PATIENTS: Record<number, Partial<Record<ServiceType, number>>> = {
  1:  { RPM: 142, CCM: 87  },
  2:  { RPM: 58              },
  3:  {           CCM: 34  },
  4:  { RPM: 201, CCM: 115 },
  5:  { RPM: 76              },
  6:  { RPM: 93,  CCM: 61  },
  7:  {           CCM: 0   },
  8:  { RPM: 167, CCM: 98  },
  9:  { RPM: 44              },
  10: { RPM: 130, CCM: 72  },
  11: {           CCM: 0   },
  12: { RPM: 29              },
}
