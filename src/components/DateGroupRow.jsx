export default function DateGroupRow({ date }) {
    return (
      <tr className="sticky top-0 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
        <td colSpan={6} className="px-2 py-1 font-medium">{date}</td>
      </tr>
    )
  }
  