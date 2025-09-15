import styles from '@/styles/Badge.module.css';

export default function BadgeCard({ badge, isUnlocked }) {
  const Icon = badge.icon;
  const cardStyle = isUnlocked ? styles.unlocked : styles.locked;
  
  return (
    <div className={`${styles.card} ${cardStyle}`}>
      <Icon className={styles.icon} />
      <h3>{badge.name}</h3>
      <p>{badge.description}</p>
    </div>
  );
}