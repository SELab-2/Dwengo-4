import '../../index.css';
import React from 'react';
import ClassesStudent from '../../components/student/ClassesStudent';

export default function StudentIndex() {
  return (
    <>
      <div className="px-10 bg-gray-300">
        <div className="text-6xl pt-12 font-bold">Home</div>

        <h2 className="mt-8 text-2xl font-bold">Assignments</h2>
        <div className="w-full mt-4 overflow-x-auto ">
          <div className="flex flex-row gap-x-5 h-[12.5rem]  ">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center flex-row py-2 px-3.5 w-[30rem] h-[11.5rem] justify-between bg-gray-100 rounded-lg shrink-0"
              >
                <div className="flex flex-row h-36 w-36 rounded-lg">
                  <img
                    className="flex rounded-lg"
                    src="img/anna-blue-annabiue.gif"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-row w-72 justify-between">
                    <h3 className="text-2xl font-bold">Path name</h3>
                    <p className="text-sm text-gray-700 translate-y-1.5">
                      Deadline: 23/02/2025{' '}
                    </p>
                  </div>
                  <div className="w-64 h-20 mt-1 text-gray-500 line-clamp-3">
                    Chew foot twitch tail in permanent irritation or play with
                    twist ties when owners are asleep, cry for no apparent
                    reason. Meow all night shove bum in owner's face like camera
                    lens check cat door for ambush 10 times before coming in yet
                    jump up to edge of bath, fall in then scramble in a mad
                    panic to get out cats are the world. Human is washing you
                  </div>
                  <div className="flex mt-1 flex-row justify-between items-center text-sm">
                    <button className=" bg-gray-300 text- hover:cursor-pointer hover:bg-gray-400 p-1.5 w-fit rounded-lg">
                      View Learning Path
                    </button>
                    <p>12/50 completed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-row justify-end w-full hover:cursor-pointer hover:underline">
          <h2 className="font-bold">
            View All Assignments
            <i className="fa-solid ml-1.5 fa-arrow-right"></i>
          </h2>
        </div>

        <p className="text-2xl mt-8 font-bold">Klasgroepen</p>
        <ClassesStudent />
      </div>
    </>
  );
}
