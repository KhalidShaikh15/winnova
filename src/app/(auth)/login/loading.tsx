import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function LoginLoading() {
    return (
        <div className="w-full max-w-sm px-4">
            <div className="flex justify-center mb-6">
                 <Skeleton className="h-8 w-32" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                         <Skeleton className="h-4 w-16" />
                         <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="grid gap-2">
                         <Skeleton className="h-4 w-16" />
                         <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-4 w-48 mt-4" />
                </CardFooter>
            </Card>
        </div>
    )
}
