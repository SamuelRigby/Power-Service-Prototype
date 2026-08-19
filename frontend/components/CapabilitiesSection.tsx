import { BoltIcon, MeterIcon, ScheduleGridIcon } from "./icons";
import styles from "./CapabilitiesSection.module.css";

const capabilities = [
  {
    icon: MeterIcon,
    title: "Customer Accounts",
    body: "Create and manage customer records: service account number, address, usage, and payment history.",
  },
  {
    icon: BoltIcon,
    title: "Power Sources",
    body: "Track power sources by type - wind, solar, hydro, gas, and more - along with instantaneous and actual output.",
  },
  {
    icon: ScheduleGridIcon,
    title: "Weekly Scheduling",
    body: "Assign a power source to every hour of a recurring Sunday-through-Saturday grid, set once and reused.",
  },
];

export function CapabilitiesSection() {
  return (
    <section className={styles.section} id="capabilities">
      <div className="container">
        <p className={styles.eyebrow}>What It Does</p>
        <h2 className={styles.heading}>Three features, demoed end to end.</h2>

        <div className={styles.diagram}>
          <div className={styles.connector} aria-hidden="true" />
          <div className={styles.panels}>
            {capabilities.map(({ icon: Icon, title, body }) => (
              <div className={styles.panel} key={title}>
                <span className={styles.node} aria-hidden="true" />
                <Icon className={styles.icon} />
                <h3 className={styles.panelTitle}>{title}</h3>
                <p className={styles.panelBody}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
