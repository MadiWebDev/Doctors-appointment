import React from 'react'

const NotFoundPage = ({keyword}) => {
  return (
    <>
    <main className="grid min-h-full place-items-center  px-6 py-24 sm:py-3 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-3xl">Product Not Found </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">Sorry, we couldn’t find the Product</p>
<h2 className=' text-2xl ' > keyword : { keyword } </h2>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/products/getAllProducts"
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go back
            </a>
            <a href="#" className="text-sm font-semibold text-gray-900">
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
      <hr/>
    
    
    </>
  )
}

export default NotFoundPage