export default function Test() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">Test Page</h1>
        <p className="text-gray-600">If you can see this, React is working!</p>
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-500">Current time: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
