import React from 'react';
import storiesArtwork from '../assets/images/stories_coming_soon_1790679776322.jpg';
import { Button } from '../components/Button';
import { BookOpen } from 'lucide-react';

export const StoriesPage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#28211A] dark:text-[#F0EAE1]">
          Stories
        </h1>
        <p className="mt-1 text-sm text-[#746659] dark:text-[#B3A596]">
          Discover stories, folklore and cultural memories from across India.
        </p>
      </div>

      {/* Heritage Artwork & Empty State Card */}
      <div className="rounded-2xl border border-[#E6DCD1] dark:border-[#38302A] bg-[#FFFFFF] dark:bg-[#201B17] overflow-hidden shadow-xs">
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#F2ECE3] dark:bg-[#28211A]">
          <img
            src={storiesArtwork}
            alt="Traditional Indian folklore manuscripts and brass diya"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="text-xs uppercase tracking-widest font-semibold opacity-85">
              Folklore & Oral Traditions
            </span>
            <p className="font-display text-xl sm:text-2xl font-bold mt-1">
              Where India Plays, Tells & Remembers
            </p>
          </div>
        </div>

        {/* Coming Soon content */}
        <div className="p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-[#F5EFEB] dark:bg-[#2A241F] text-[#B43B22] dark:text-[#E46B52] flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#28211A] dark:text-[#F0EAE1]">
              Coming Soon
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#746659] dark:text-[#B3A596] max-w-md mx-auto leading-relaxed">
              We are curating folklore, regional origin tales, and community memories tied to Indian traditional games and cultural traditions.
            </p>
          </div>

          <div className="pt-2">
            <Button disabled variant="secondary" size="md">
              Explore Stories (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
