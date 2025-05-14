'use client'

import AdminLayout from '@/components/layout/AdminLayout'

export default function Home() {
  return (
    <AdminLayout>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>Dashboard</h1>
            </div>
          </div>
        </div>
      </section>
      
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Bem-vindo</h3>
                </div>
                <div className="card-body">
                  <p>Projeto base do AgileCheckup com Next.js, AdminLTE 3.2 e Bootstrap 5!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
