import { useState, useEffect } from 'react'
import hicareLogo from '../../assets/hicare-logo.png'

const STORAGE_KEY = 'hcn_company_info'

export interface CompanyInfo {
  logo:       string
  phone:      string
  address:    string
  email:      string
  website:    string
  payByCheck: string
  payByZelle: string
}

export const DEFAULT_COMPANY: CompanyInfo = {
  logo:       hicareLogo,
  phone:      '1-855-844-8300',
  address:    '10 Corporate Park, Irvine, CA 92606',
  email:      'accounting@hicare.net',
  website:    'www.hicare.net',
  payByCheck: 'Payee: Hicare.net Inc.\n10 Corporate Park #335 Irvine, CA 92606',
  payByZelle: 'Cell Phone: 949-695-7869\nName: HICARE.NET INC.',
}

export function useCompanyInfo() {
  const [company, setCompany] = useState<CompanyInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? { ...DEFAULT_COMPANY, ...JSON.parse(stored) } : DEFAULT_COMPANY
    } catch {
      return DEFAULT_COMPANY
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(company))
  }, [company])

  return { company, setCompany }
}
