import * as React from "react";

export type IconProps = Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
  /** Width and height in px. Default 24. */
  size?: number | string;
  /** Stroke width. Default 2. */
  strokeWidth?: number | string;
  /** Accessible label. Without one the icon is hidden from screen readers. */
  title?: string;
};

export type IconComponent = React.ForwardRefExoticComponent<
  IconProps & React.RefAttributes<SVGSVGElement>
>;

/** Build an icon component from a single 24×24 path string. */
export function createIcon(name: string, d: string): IconComponent {
  const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, strokeWidth = 2, title, color = "currentColor", ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        {...props}
      >
        {title ? <title>{title}</title> : null}
        <path d={d} />
      </svg>
    ),
  );
  Icon.displayName = name;
  return Icon;
}

const CIRCLE = "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z";

/** Every icon's path data, keyed by kebab-case name. */
export const iconPaths = {
  home: "M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z",
  search: "M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L21 21",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.8c2.2.6 3.5 2.4 3.5 5.2",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1",
  bell: "M6 10a6 6 0 0 1 12 0v4l2 3H4l2-3zM10 20a2 2 0 0 0 4 0",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  chat: "M4 4h16v12H9l-5 4z",
  heart: "M12 20s-8-4.8-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.2 12 20 12 20z",
  star: "M12 3l2.8 5.8 6.2.9-4.5 4.4 1.1 6.2L12 17.4l-5.6 2.9 1.1-6.2L3 9.7l6.2-.9z",
  bookmark: "M6 3h12v18l-6-4-6 4z",
  calendar: "M4 5h16v16H4zM4 10h16M8 3v4M16 3v4",
  clock: CIRCLE + "M12 7v5l3 2",
  camera: "M3 8h4l2-3h6l2 3h4v12H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  image: "M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01",
  video: "M3 6h12v12H3zM15 10l6-3v10l-6-3",
  mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zM5 11a7 7 0 0 0 14 0M12 18v3",
  play: "M7 4l13 8-13 8z",
  pause: "M7 4h3v16H7zM14 4h3v16h-3z",
  download: "M12 3v12M7 10l5 5 5-5M4 19h16",
  upload: "M12 21V9M7 14l5-5 5 5M4 5h16",
  share: "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 10.5l6.8-4M8.6 13.5l6.8 4",
  link: "M10 14a4 4 0 0 0 5.7 0l3-3A4 4 0 0 0 13 5.3l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  unlock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.5-2",
  eye: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  "eye-off": "M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6",
  edit: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  copy: "M8 8h12v12H8zM16 8V4H4v12h4",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  x: "M6 6l12 12M18 6L6 18",
  check: "M5 12.5l4.5 4.5L19 7",
  "chevron-right": "M9 5l7 7-7 7",
  "chevron-left": "M15 5l-7 7 7 7",
  "chevron-down": "M5 9l7 7 7-7",
  "chevron-up": "M5 15l7-7 7 7",
  "arrow-right": "M4 12h16M14 6l6 6-6 6",
  "arrow-up-right": "M7 17L17 7M8 7h9v9",
  refresh: "M20 11a8 8 0 0 0-14.6-4.5M4 4v4h4M4 13a8 8 0 0 0 14.6 4.5M20 20v-4h-4",
  filter: "M3 5h18l-7 8v6l-4 2v-8z",
  sliders: "M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M16 4v4M10 10v4M18 16v4",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  list: "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  menu: "M4 6h16M4 12h16M4 18h16",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  cart: "M3 4h2l2.5 11h11L21 7H6.5M9 20h.01M18 20h.01",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  wallet: "M3 7h16v13H3zM3 7l12-4v4M16 13h2",
  tag: "M3 12V3h9l9 9-9 9zM8 8h.01",
  globe: CIRCLE + "M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  "map-pin": "M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M1 12h2M21 12h2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z",
  cloud: "M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1 0 9z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  code: "M8 6l-6 6 6 6M16 6l6 6-6 6",
  terminal: "M3 4h18v16H3zM7 9l3 3-3 3M13 15h4",
  database: "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  file: "M6 2h8l5 5v15H6zM14 2v5h5",
  folder: "M3 6h6l2 2h10v11H3z",
  chart: "M4 20V10M10 20V4M16 20v-7M2 20h20",
  trending: "M3 17l6-6 4 4 8-8M15 7h6v6",
  info: CIRCLE + "M12 11v6M12 7.5h.01",
  alert: "M12 3l10 18H2zM12 10v5M12 18h.01",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  command: "M9 9V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
} as const;

export type IconName = keyof typeof iconPaths;

export const HomeIcon = createIcon("HomeIcon", iconPaths.home);
export const SearchIcon = createIcon("SearchIcon", iconPaths.search);
export const UserIcon = createIcon("UserIcon", iconPaths.user);
export const UsersIcon = createIcon("UsersIcon", iconPaths.users);
export const SettingsIcon = createIcon("SettingsIcon", iconPaths.settings);
export const BellIcon = createIcon("BellIcon", iconPaths.bell);
export const MailIcon = createIcon("MailIcon", iconPaths.mail);
export const ChatIcon = createIcon("ChatIcon", iconPaths.chat);
export const HeartIcon = createIcon("HeartIcon", iconPaths.heart);
export const StarIcon = createIcon("StarIcon", iconPaths.star);
export const BookmarkIcon = createIcon("BookmarkIcon", iconPaths.bookmark);
export const CalendarIcon = createIcon("CalendarIcon", iconPaths.calendar);
export const ClockIcon = createIcon("ClockIcon", iconPaths.clock);
export const CameraIcon = createIcon("CameraIcon", iconPaths.camera);
export const ImageIcon = createIcon("ImageIcon", iconPaths.image);
export const VideoIcon = createIcon("VideoIcon", iconPaths.video);
export const MicIcon = createIcon("MicIcon", iconPaths.mic);
export const PlayIcon = createIcon("PlayIcon", iconPaths.play);
export const PauseIcon = createIcon("PauseIcon", iconPaths.pause);
export const DownloadIcon = createIcon("DownloadIcon", iconPaths.download);
export const UploadIcon = createIcon("UploadIcon", iconPaths.upload);
export const ShareIcon = createIcon("ShareIcon", iconPaths.share);
export const LinkIcon = createIcon("LinkIcon", iconPaths.link);
export const LockIcon = createIcon("LockIcon", iconPaths.lock);
export const UnlockIcon = createIcon("UnlockIcon", iconPaths.unlock);
export const EyeIcon = createIcon("EyeIcon", iconPaths.eye);
export const EyeOffIcon = createIcon("EyeOffIcon", iconPaths["eye-off"]);
export const TrashIcon = createIcon("TrashIcon", iconPaths.trash);
export const EditIcon = createIcon("EditIcon", iconPaths.edit);
export const CopyIcon = createIcon("CopyIcon", iconPaths.copy);
export const PlusIcon = createIcon("PlusIcon", iconPaths.plus);
export const MinusIcon = createIcon("MinusIcon", iconPaths.minus);
export const XIcon = createIcon("XIcon", iconPaths.x);
export const CheckIcon = createIcon("CheckIcon", iconPaths.check);
export const ChevronRightIcon = createIcon("ChevronRightIcon", iconPaths["chevron-right"]);
export const ChevronLeftIcon = createIcon("ChevronLeftIcon", iconPaths["chevron-left"]);
export const ChevronDownIcon = createIcon("ChevronDownIcon", iconPaths["chevron-down"]);
export const ChevronUpIcon = createIcon("ChevronUpIcon", iconPaths["chevron-up"]);
export const ArrowRightIcon = createIcon("ArrowRightIcon", iconPaths["arrow-right"]);
export const ArrowUpRightIcon = createIcon("ArrowUpRightIcon", iconPaths["arrow-up-right"]);
export const RefreshIcon = createIcon("RefreshIcon", iconPaths.refresh);
export const FilterIcon = createIcon("FilterIcon", iconPaths.filter);
export const SlidersIcon = createIcon("SlidersIcon", iconPaths.sliders);
export const GridIcon = createIcon("GridIcon", iconPaths.grid);
export const ListIcon = createIcon("ListIcon", iconPaths.list);
export const MenuIcon = createIcon("MenuIcon", iconPaths.menu);
export const MoreIcon = createIcon("MoreIcon", iconPaths.more);
export const CartIcon = createIcon("CartIcon", iconPaths.cart);
export const CardIcon = createIcon("CardIcon", iconPaths.card);
export const WalletIcon = createIcon("WalletIcon", iconPaths.wallet);
export const TagIcon = createIcon("TagIcon", iconPaths.tag);
export const GlobeIcon = createIcon("GlobeIcon", iconPaths.globe);
export const MapPinIcon = createIcon("MapPinIcon", iconPaths["map-pin"]);
export const SunIcon = createIcon("SunIcon", iconPaths.sun);
export const MoonIcon = createIcon("MoonIcon", iconPaths.moon);
export const CloudIcon = createIcon("CloudIcon", iconPaths.cloud);
export const BoltIcon = createIcon("BoltIcon", iconPaths.bolt);
export const CodeIcon = createIcon("CodeIcon", iconPaths.code);
export const TerminalIcon = createIcon("TerminalIcon", iconPaths.terminal);
export const DatabaseIcon = createIcon("DatabaseIcon", iconPaths.database);
export const FileIcon = createIcon("FileIcon", iconPaths.file);
export const FolderIcon = createIcon("FolderIcon", iconPaths.folder);
export const ChartIcon = createIcon("ChartIcon", iconPaths.chart);
export const TrendingIcon = createIcon("TrendingIcon", iconPaths.trending);
export const InfoIcon = createIcon("InfoIcon", iconPaths.info);
export const AlertIcon = createIcon("AlertIcon", iconPaths.alert);
export const SparkleIcon = createIcon("SparkleIcon", iconPaths.sparkle);
export const CommandIcon = createIcon("CommandIcon", iconPaths.command);
export const LayersIcon = createIcon("LayersIcon", iconPaths.layers);

/** Render any icon by name, e.g. <Icon name="bell" />. */
export function Icon({ name, ...props }: IconProps & { name: IconName }) {
  const d = iconPaths[name];
  const C = React.useMemo(() => createIcon(name, d), [name, d]);
  return <C {...props} />;
}
