interface Props {
  isVisible: boolean;
}

const Disclaimer: React.FC<Props> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
      <p>
        All data is processed locally in your browser. It is neither stored nor
        transmitted, and is discarded when you refresh or exit the page.
      </p>
    </div>
  );
};

export default Disclaimer;
