import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import styles from './App.module.css';
import { Users, Globe, MoreVertical, MessageCircle, MapPin, Search, Filter, TrendingUp, ChevronDown, Mail } from 'lucide-react';

const InstagramIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const NavigateIcon = ({ size = 14 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);

function App() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [stats, setStats] = useState({ total: 0, conIg: 0, pendientes: 0 });

  useEffect(() => { fetchLeads(); }, []);
  useEffect(() => { applyFilters(); }, [leads, searchTerm, statusFilter]);

  async function fetchLeads() {
    setLoading(true);
    const { data } = await supabase
      .from('leads_gyms')
      .select('*')
      .order('creado_el', { ascending: false });
    if (data) {
      setLeads(data);
      setStats({
        total: data.length,
        conIg: data.filter(l => l.instagram).length,
        pendientes: data.filter(l => l.estado === 'pendiente').length,
      });
    }
    setLoading(false);
  }

  function applyFilters() {
    let result = leads;
    if (searchTerm) {
      result = result.filter(lead =>
        lead.nombre_gym.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.direccion && lead.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (statusFilter !== 'todos') {
      result = result.filter(lead => lead.estado === statusFilter);
    }
    setFilteredLeads(result);
  }

  return (
    <div className={styles.dashboard}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logoMark}>GF</div>
          <div>
            <h1 className={styles.headerTitle}>GenFit Core</h1>
            <p className={styles.headerSub}>Centro de Prospección · Mendoza</p>
          </div>
        </div>
        <button onClick={fetchLeads} className={styles.refreshBtn} disabled={loading}>
          <TrendingUp size={14} />
          {loading ? 'Sincronizando…' : 'Actualizar'}
        </button>
      </header>

      {/* ── Stat cards ── */}
      <div className={styles.statsGrid}>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(170,59,255,0.08)', color: '#aa3bff' }}>
            <Users size={19} />
          </div>
          <div className={styles.cardBody}>
            <strong>{stats.total}</strong>
            <span>Total Leads</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(225,48,108,0.08)', color: '#e1306c' }}>
            <InstagramIcon size={19} />
          </div>
          <div className={styles.cardBody}>
            <strong>{stats.conIg}</strong>
            <span>Con Instagram</span>
          </div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon} style={{ background: 'rgba(217,119,6,0.08)', color: '#d97706' }}>
            <Filter size={19} />
          </div>
          <div className={styles.cardBody}>
            <strong>{stats.pendientes}</strong>
            <span>Pendientes</span>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre o zona…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.selectWrapper}>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="contactado">Contactado</option>
            <option value="cliente">Cliente</option>
          </select>
          <ChevronDown size={13} className={styles.selectChevron} />
        </div>
        <span className={styles.resultCount}>
          {filteredLeads.length} resultado{filteredLeads.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loader}>
            <span className={styles.loaderDot} />
            <span className={styles.loaderDot} />
            <span className={styles.loaderDot} />
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Gimnasio</th>
                <th style={{ width: '19%' }}>Dirección</th>
                <th style={{ width: '18%' }}>Email</th>
                <th style={{ width: '9%' }}>Distancia</th>
                <th style={{ width: '11%' }}>Estado</th>
                <th style={{ width: '11%' }}>Encontrado</th>
                <th style={{ width: '10%', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? filteredLeads.map(lead => (
                <tr key={lead.id}>
                  {/* Gym name */}
                  <td>
                    <div className={styles.nameCellInner}>
                      <div className={styles.gymAvatar}>
                        {lead.nombre_gym.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.gymName}>{lead.nombre_gym}</span>
                    </div>
                  </td>

                  {/* Address */}
                  <td>
                    <div className={styles.addressInner}>
                      <MapPin size={12} className={styles.pinIcon} />
                      <span className={styles.addressText}>{lead.direccion || '—'}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td>
                    {lead.email
                      ? <a href={`mailto:${lead.email}`} className={styles.emailLink}>
                          <Mail size={12} className={styles.pinIcon} />
                          <span className={styles.addressText}>{lead.email}</span>
                        </a>
                      : <span className={styles.addressText}>—</span>
                    }
                  </td>

                  {/* Distance */}
                  <td>
                    <span className={styles.distanceBadge}>{lead.distancia || '—'}</span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`${styles.statusBadge} ${styles[lead.estado] || styles.pendiente}`}>
                      {lead.estado}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td>
                    <span className={styles.fechaBadge}>
                      {lead.creado_el
                        ? new Date(lead.creado_el).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'center' }}>
                    <div className={styles.dropdown}>
                      <button className={styles.dropbtn}>
                        Acciones <MoreVertical size={12} />
                      </button>
                      <div className={styles.dropdownContent}>
                        {lead.instagram && (
                          <a href={lead.instagram} target="_blank" rel="noreferrer" className={styles.igLink}>
                            <InstagramIcon size={13} /> Abrir Instagram
                          </a>
                        )}
                        {lead.sitio_web && (
                          <a href={lead.sitio_web} target="_blank" rel="noreferrer">
                            <Globe size={13} /> Ver Sitio Web
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className={styles.mailLink}>
                            <Mail size={13} /> Enviar Email
                          </a>
                        )}
                        <a
                          href={`https://wa.me/?text=Hola! Vi el gimnasio ${lead.nombre_gym} y me gustaría comentarles sobre una propuesta de software.`}
                          target="_blank" rel="noreferrer"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                        <div className={styles.divider} />
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(lead.direccion || lead.nombre_gym + ', Mendoza')}`}
                          target="_blank" rel="noreferrer"
                          className={styles.mapLink}
                        >
                          <NavigateIcon size={13} /> Cómo llegar
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className={styles.noResults}>
                    <div className={styles.emptyState}>
                      <Search size={26} />
                      <p>Sin resultados para "{searchTerm}"</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;