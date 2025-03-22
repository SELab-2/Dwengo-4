import {useQuery} from "@tanstack/react-query";
import {ClassItem, fetchClasses} from "../../util/student/httpStudent";
import React from "react";

const ClassesPage: React.FC = () => {

    const {data: classes, isLoading, isError, error} = useQuery<ClassItem[]>({
        queryKey: ["classes"],
        queryFn: fetchClasses,
    });


    return (<>
        {isLoading && <p>Loading...</p>}
        {isError && (
            <p className="c-r">
                {(error as any)?.info?.message ||
                    "Er is iets fout gegaan bij het ophalen van de klassen."}
            </p>
        )}

        {!isLoading && !isError && (
            <>
                <p className="text-2xl mt-8 font-bold">Classes</p>
                <div className="w-full flex flex-row justify-center">
                    <div className="bg-white rounded-xl m-12 flex flex-row w-full xl:w-[90rem] justify-center">
                        <div className="flex-col flex items-center m-12 gap-y-7 w-full">
                            {Array.from({length: 5}).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center flex-row py-2 px-3.5 w-[38rem] h-[11.5rem] justify-between bg-gray-100 rounded-lg shrink-0"
                                >
                                    <div className="flex flex-row h-36 w-36 rounded-lg">
                                        <img
                                            className="flex rounded-lg"
                                            src="img/anna-blue-annabiue.gif"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex flex-row w-full justify-between">
                                            <h3 className="text-2xl font-bold">Class {index + 1}</h3>
                                        </div>
                                        <div className="w-96 h-20 mt-1 text-gray-500 line-clamp-3">
                                            Chew foot twitch tail in permanent irritation or play with
                                            twist ties when owners are asleep, cry for no apparent
                                            reason. Meow all night shove bum in owner's face like
                                            camera lens check cat door for ambush 10 times before
                                            coming in yet jump up to edge of bath, fall in then
                                            scramble in a mad panic to get out cats are the world.
                                            Human is washing you
                                        </div>
                                        <div
                                            className="flex mt-1 flex-row justify-between items-center text-sm">
                                            <button
                                                className=" bg-gray-300 text- hover:cursor-pointer hover:bg-gray-400 p-1.5 w-fit rounded-lg">
                                                View Class
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>)}
    </>)
};

export default ClassesPage;
