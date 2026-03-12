import ChoiceLevel from './Levels/ChoiceLevel';
import UploadLevel from './Levels/UploadLevel';

export default function LevelContent({ level, busy, result, onChoice, playerCode, photoStatus, onRefresh }) {
  if (level.type === 'upload') {
    return <UploadLevel level={level} playerCode={playerCode} photoStatus={photoStatus} onRefresh={onRefresh} />;
  }
  return <ChoiceLevel level={level} busy={busy} result={result} onChoice={onChoice} />;
}
