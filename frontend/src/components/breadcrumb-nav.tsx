"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { useMemo, useEffect, useState } from "react"
import { navItems } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getRFQ } from "@/lib/api"

export function BreadcrumbNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [rfqTitle, setRfqTitle] = useState<string>("")
  
  // Fetch RFQ title when on details page
  useEffect(() => {
    async function fetchRFQTitle() {
      if (pathname === '/rfq/details') {
        const id = searchParams.get('id')
        if (id) {
          try {
            const rfq = await getRFQ(id)
            setRfqTitle(rfq.title)
          } catch (error) {
            console.error("Error fetching RFQ:", error)
          }
        }
      }
    }
    
    fetchRFQTitle()
  }, [pathname, searchParams])
  
  const breadcrumbItems = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    
    if (segments.length === 0) { 
      return []
    }
      

    
    return [
      {
        title: 'Home',
        url: '/',
        isCurrentPage: segments.length === 0
      },

      ...segments.map((segment, index) => {
        const url = '/' + segments.slice(0, index + 1).join('/')
        return {
          title: segment.charAt(0).toUpperCase() + segment.slice(1),
          url: url,
          isCurrentPage: index === segments.length - 1
        }
      })
    ]
  }, [pathname, searchParams, rfqTitle])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.url}>
            <BreadcrumbItem>
              {item.isCurrentPage ? (
                <BreadcrumbPage>{item.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.url}>
                  {item.title}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && (
              <BreadcrumbSeparator />
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
} 