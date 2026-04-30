import { Link, useParams } from "react-router-dom";

function Navbar() {
  const { groupId } = useParams();

  if (!groupId) {
    return null;
  }

  return (
    <div className="bg-zinc-900 h-14 w-full shadow-md border-b border-zinc-800 flex flex-row justify-between place-items-center p-4">
      <span className="text-xl">ezCalendar</span>
      <div className="flex flex-row gap-6 pr-4">
        <Link
          to={`/${groupId}/calendar`}
          className="text-sm text-zinc-300 hover:text-zinc-100"
        >
          Calendar
        </Link>
        <Link
          to={`/${groupId}/members`}
          className="text-sm text-zinc-300 hover:text-zinc-100"
        >
          Members
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
