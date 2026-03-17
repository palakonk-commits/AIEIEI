import ChoiceLevel from './Levels/ChoiceLevel';
import UploadLevel from './Levels/UploadLevel';
import TicTacToeLevel from './Levels/TicTacToeLevel';
import SafeCrackerLevel from './Levels/SafeCrackerLevel';
import MemorySyncLevel from './Levels/MemorySyncLevel';
import MazeLevel from './Levels/MazeLevel';
import BossClickerLevel from './Levels/BossClickerLevel';

export default function LevelContent({ level, busy, result, onChoice, playerCode, photoStatus, onRefresh }) {
  if (level.type === 'upload') {
    return <UploadLevel level={level} playerCode={playerCode} photoStatus={photoStatus} onRefresh={onRefresh} />;
  }
  
  if (level.type === 'tictactoe') {
    return <TicTacToeLevel level={level} busy={busy} result={result} onChoice={onChoice} playerCode={playerCode} />;
  }

  if (level.type === 'safecracker') {
    return <SafeCrackerLevel level={level} busy={busy} result={result} onChoice={onChoice} />;
  }

  if (level.type === 'memorysync') {
    return <MemorySyncLevel level={level} busy={busy} result={result} onChoice={onChoice} />;
  }

  if (level.type === 'maze') {
    return <MazeLevel level={level} busy={busy} result={result} onChoice={onChoice} playerCode={playerCode} />;
  }

  if (level.type === 'boss-clicker') {
    return <BossClickerLevel level={level} busy={busy} result={result} onChoice={onChoice} />;
  }

  return <ChoiceLevel level={level} busy={busy} result={result} onChoice={onChoice} />;
}
