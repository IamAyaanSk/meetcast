export function WaitingState() {
  return (
    <div className="p-8 flex flex-col items-center justify-center gap-2 h-full w-full max-w-lg text-center mx-auto">
      <h2 className="text-2xl font-semibold text-cyan-400">Stream Not Live Yet</h2>
      <p className="text-gray-300 mb-6 leading-relaxed">
        If call was started recently it may take a few moments for the stream to be available.
      </p>
    </div>
  )
}
