import React from 'react';
import { Track } from '@shared/types';
import AudioPlayer from '../common/AudioPlayer';
import { formatDuration } from '../../utils/helpers';
import Card from '../common/Card';

interface TrackListItemProps {
  track: Track;
}

const TrackListItem: React.FC<TrackListItemProps> = ({ track }) => {
  return (
    <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex-grow">
        <p className="text-lg font-medium text-gray-50">{track.track_number}. {track.title}</p>
        {track.isrc && <p className="text-gray-400 text-sm">ISRC: {track.isrc}</p>}
        {track.duration && <p className="text-gray-400 text-sm">Duration: {formatDuration(track.duration)}</p>}
      </div>
      {track.audio_file_url && (
        <div className="flex-shrink-0 w-full md:w-auto">
          <AudioPlayer src={track.audio_file_url} />
        </div>
      )}
    </Card>
  );
};

export default TrackListItem;