"use client";

import styles from "./kasir.module.css";
import Sidebar from "../../component/Sidebar";

export default function AdminKasirPage() {
    return( <div className={styles.container}>
        <Sidebar />
    
        <main className={styles.main}>
          <header className={styles.header}>
            <button className={styles.logout}>Keluar</button>
          </header>
    
          <section className={styles.content}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Grafik Harian</h3>
                <a href="#">Download Grafik Harian</a>
              </div>
              <div className={styles.chart}>Grafik Harian</div>
            </div>
    
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Grafik Mingguan</h3>
                <a href="#">Download Grafik Mingguan</a>
              </div>
              <div className={styles.chart}>Grafik Mingguan</div>
            </div>
    
            <div className={styles.cardFull}>
              <div className={styles.cardHeader}>
                <h3>Grafik Bulanan</h3>
                <a href="#">Download Grafik Bulanan</a>
              </div>
              <div className={styles.chartLarge}>Grafik Bulanan</div>
            </div>
          </section>
        </main>
      </div>
    )}