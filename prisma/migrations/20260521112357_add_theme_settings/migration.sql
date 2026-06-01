-- AlterTable
ALTER TABLE "School" ADD COLUMN     "borderRadius" TEXT DEFAULT 'lg',
ADD COLUMN     "buttonStyle" TEXT DEFAULT 'default',
ADD COLUMN     "cardStyle" TEXT DEFAULT 'default',
ADD COLUMN     "fontFamily" TEXT DEFAULT 'Inter',
ADD COLUMN     "fontSize" TEXT DEFAULT 'base',
ADD COLUMN     "fontWeight" TEXT DEFAULT 'normal',
ADD COLUMN     "layoutDensity" TEXT DEFAULT 'comfortable',
ADD COLUMN     "shadowSize" TEXT DEFAULT 'md',
ADD COLUMN     "spacing" TEXT DEFAULT 'normal',
ADD COLUMN     "themePreset" TEXT DEFAULT 'moderno';
