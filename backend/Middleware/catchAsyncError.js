export default function catchAsyncError(catchAsyncError) {
   return (req, res, next) => {
      Promise.resolve(catchAsyncError(req, res, next)).catch(next);
   };
  }
  