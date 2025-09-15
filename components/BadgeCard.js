import styles from '@/styles/Badge.module.css';

export default function BadgeCard({ badge, isUnlocked }) {
  const Icon = badge.icon;
  
  // Conditionally apply 'unlocked' or 'locked' style to the main card
  const cardClasses = isUnlocked 
    ? `${styles.card} ${styles.unlocked}` 
    : `${styles.card} ${styles.locked}`;
  
  return (
    <div className={cardClasses}>
      {/* This wrapper div is targeted by your CSS for specific icon styling */}
      <div className={styles.icon}>
        <Icon />
      </div>
      <h3>{badge.name}</h3>
      <p>{badge.description}</p>
    </div>
  );
}